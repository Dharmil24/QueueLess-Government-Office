const Counter = require('../models/Counter');
const Token = require('../models/Token');
const Office = require('../models/Office');
const { recalculateQueue, sendNotification } = require('../services/queueService');
const { emitToOffice, emitToUser } = require('../sockets/socketHandler');
const { logAction } = require('../utils/auditLogger');

// @desc    Get staff counter status and live queue for assigned counter
// @route   GET /api/staff/queue
// @access  Private (Staff/Admin)
const getStaffQueue = async (req, res, next) => {
  try {
    const user = req.user;

    let counter = null;
    if (user.assignedCounter) {
      counter = await Counter.findById(user.assignedCounter)
        .populate('office', 'name code address')
        .populate('services', 'name code averageServiceTime requiredDocuments')
        .populate({
          path: 'currentToken',
          populate: { path: 'serviceId', select: 'name code requiredDocuments averageServiceTime' },
        });
    } else {
      // Find or default to any counter in staff's office
      counter = await Counter.findOne({ office: user.assignedOffice, status: 'active' })
        .populate('office', 'name code address')
        .populate('services', 'name code averageServiceTime requiredDocuments')
        .populate({
          path: 'currentToken',
          populate: { path: 'serviceId', select: 'name code requiredDocuments averageServiceTime' },
        });
    }

    if (!counter) {
      return res.status(404).json({
        success: false,
        message: 'No active counter assigned to your profile.',
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Waiting queue for the services handled by this counter
    const serviceIds = counter.services.map((s) => s._id);

    const waitingTokens = await Token.find({
      officeId: counter.office._id,
      serviceId: { $in: serviceIds },
      status: { $in: ['WAITING', 'APPROACHING'] },
    })
      .populate('serviceId', 'name code requiredDocuments averageServiceTime')
      .populate('citizenId', 'name email mobile dateOfBirth isSeniorCitizen')
      .sort({ priorityScore: -1, priority: -1, queuePosition: 1, generatedAt: 1 });

    const nextToken = waitingTokens[0] || null;

    // Completed today by this counter
    const completedToday = await Token.countDocuments({
      counterId: counter._id,
      status: 'COMPLETED',
      completedAt: { $gte: startOfDay },
    });

    // Skipped today by this counter
    const skippedToday = await Token.countDocuments({
      counterId: counter._id,
      status: 'SKIPPED',
      updatedAt: { $gte: startOfDay },
    });

    res.status(200).json({
      success: true,
      counter: {
        id: counter._id,
        counterNumber: counter.counterNumber,
        status: counter.status,
        office: counter.office,
        services: counter.services,
      },
      currentToken: counter.currentToken,
      nextToken,
      waitingTokens,
      waitingCount: waitingTokens.length,
      completedToday,
      skippedToday,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Call next token in line for this counter
// @route   POST /api/staff/token/next
// @access  Private (Staff/Admin)
const callNextToken = async (req, res, next) => {
  try {
    const user = req.user;
    let counterId = req.body?.counterId || user.assignedCounter;

    let counter = null;
    if (counterId) {
      counter = await Counter.findById(counterId).populate('office');
    } else if (user.assignedOffice) {
      counter = await Counter.findOne({ office: user.assignedOffice, status: 'active' }).populate('office');
    }

    if (!counter) {
      return res.status(404).json({ success: false, message: 'Counter not found or not assigned to staff.' });
    }

    // Auto-complete or handle previous currentToken if still in CALLED/SERVING
    if (counter.currentToken) {
      const prev = await Token.findById(counter.currentToken);
      if (prev && ['CALLED', 'SERVING'].includes(prev.status)) {
        return res.status(400).json({
          success: false,
          message: `Counter currently has token ${prev.tokenNumber} in ${prev.status} state. Complete, skip, or cancel it first.`,
          currentToken: prev,
        });
      }
    }

    // Find next eligible token (Priority / Senior Citizens first, then generatedAt)
    const nextToken = await Token.findOne({
      officeId: counter.office._id,
      serviceId: { $in: counter.services },
      status: { $in: ['WAITING', 'APPROACHING'] },
    })
      .sort({ priorityScore: -1, priority: -1, generatedAt: 1 })
      .populate('serviceId', 'name code requiredDocuments averageServiceTime');

    if (!nextToken) {
      return res.status(404).json({
        success: false,
        message: 'No waiting citizens in the queue for this counter services.',
      });
    }

    nextToken.status = 'CALLED';
    nextToken.counterId = counter._id;
    nextToken.calledAt = new Date();
    await nextToken.save();

    counter.currentToken = nextToken._id;
    await counter.save();

    // Log action
    await logAction({
      user,
      action: 'CALL_NEXT',
      entity: 'Token',
      entityId: nextToken._id,
      details: { tokenNumber: nextToken.tokenNumber, counter: counter.counterNumber },
    });

    // Notify citizen
    await sendNotification({
      userId: nextToken.citizenId,
      tokenId: nextToken._id,
      title: `Token ${nextToken.tokenNumber} Called!`,
      message: `Your token ${nextToken.tokenNumber} has been called! Please proceed immediately to ${counter.counterNumber}.`,
      type: 'CALLED',
    });

    // Real-time broadcast to office, display TV, and citizen
    emitToOffice(counter.office._id.toString(), 'token_called', {
      tokenId: nextToken._id,
      tokenNumber: nextToken.tokenNumber,
      counterNumber: counter.counterNumber,
      serviceName: nextToken.serviceId?.name,
      citizenName: nextToken.citizenName,
      calledAt: nextToken.calledAt,
    });

    emitToUser(nextToken.citizenId.toString(), 'token_called_direct', {
      tokenId: nextToken._id,
      tokenNumber: nextToken.tokenNumber,
      counterNumber: counter.counterNumber,
    });

    // Recalculate remaining queue
    await recalculateQueue(counter.office._id, nextToken.serviceId._id);

    res.status(200).json({
      success: true,
      message: `Token ${nextToken.tokenNumber} successfully called to ${counter.counterNumber}.`,
      token: nextToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Recall token (re-announce on display and sound)
// @route   POST /api/staff/token/:id/recall
// @access  Private (Staff/Admin)
const recallToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('counterId', 'counterNumber')
      .populate('officeId', 'name')
      .populate('serviceId', 'name');

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    token.recalledCount = (token.recalledCount || 0) + 1;
    await token.save();

    const counterName = token.counterId?.counterNumber || 'Counter';

    emitToOffice(token.officeId._id.toString(), 'token_called', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      counterNumber: counterName,
      serviceName: token.serviceId?.name,
      citizenName: token.citizenName,
      isRecall: true,
      recalledCount: token.recalledCount,
    });

    emitToUser(token.citizenId.toString(), 'token_recalled', {
      tokenNumber: token.tokenNumber,
      counterNumber: counterName,
    });

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} recalled (${token.recalledCount} times).`,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Start service for called token
// @route   POST /api/staff/token/:id/start
// @access  Private (Staff/Admin)
const startService = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('counterId', 'counterNumber')
      .populate('serviceId', 'name');

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    token.status = 'SERVING';
    token.serviceStartedAt = new Date();
    await token.save();

    await logAction({
      user: req.user,
      action: 'START_SERVICE',
      entity: 'Token',
      entityId: token._id,
      details: { tokenNumber: token.tokenNumber },
    });

    emitToOffice(token.officeId.toString(), 'token_serving', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      counterNumber: token.counterId?.counterNumber,
    });

    res.status(200).json({
      success: true,
      message: `Service started for token ${token.tokenNumber}.`,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete service for token
// @route   POST /api/staff/token/:id/complete
// @access  Private (Staff/Admin)
const completeService = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id).populate('counterId');
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    const now = new Date();
    token.status = 'COMPLETED';
    token.completedAt = now;

    if (token.serviceStartedAt) {
      const diffMs = now.getTime() - new Date(token.serviceStartedAt).getTime();
      token.serviceDurationMinutes = Math.max(1, Math.round(diffMs / 60000));
    } else {
      token.serviceDurationMinutes = 8;
    }

    await token.save();

    // Free counter
    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId._id, { currentToken: null });
    }

    await logAction({
      user: req.user,
      action: 'COMPLETE_SERVICE',
      entity: 'Token',
      entityId: token._id,
      details: { tokenNumber: token.tokenNumber, duration: token.serviceDurationMinutes },
    });

    await sendNotification({
      userId: token.citizenId,
      tokenId: token._id,
      title: `Token ${token.tokenNumber} Completed`,
      message: `Your service at ${token.counterId?.counterNumber || 'Counter'} has been completed successfully. Thank you for using QueueLess!`,
      type: 'COMPLETED',
    });

    emitToOffice(token.officeId.toString(), 'token_completed', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    // Recalculate queue
    await recalculateQueue(token.officeId, token.serviceId);

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} marked as completed.`,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Skip token
// @route   POST /api/staff/token/:id/skip
// @access  Private (Staff/Admin)
const skipToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id).populate('counterId');
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    token.status = 'SKIPPED';
    token.notes = (token.notes ? token.notes + ' | ' : '') + 'Skipped by staff (citizen absent)';
    await token.save();

    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId._id, { currentToken: null });
    }

    await logAction({
      user: req.user,
      action: 'SKIP_TOKEN',
      entity: 'Token',
      entityId: token._id,
      details: { tokenNumber: token.tokenNumber },
    });

    await sendNotification({
      userId: token.citizenId,
      tokenId: token._id,
      title: `Token ${token.tokenNumber} Skipped`,
      message: `Your token ${token.tokenNumber} was skipped as you were not present at the counter. Please visit the help desk or re-book.`,
      type: 'ALERT',
    });

    emitToOffice(token.officeId.toString(), 'token_skipped', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    await recalculateQueue(token.officeId, token.serviceId);

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} skipped.`,
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStaffQueue,
  callNextToken,
  recallToken,
  startService,
  completeService,
  skipToken,
};

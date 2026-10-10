const Token = require('../models/Token');
const User = require('../models/User');
const Service = require('../models/Service');
const Office = require('../models/Office');
const Department = require('../models/Department');
const Counter = require('../models/Counter');
const SystemSettings = require('../models/SystemSettings');
const { generateSecureQr } = require('../utils/qrGenerator');
const { calculateWaitingTime } = require('../services/predictionService');
const { recalculateQueue, sendNotification } = require('../services/queueService');
const { emitToOffice, emitToUser } = require('../sockets/socketHandler');

// Helper to generate the next token sequence number (e.g. A-058)
const getNextTokenNumber = async (officeId, prefix = 'A') => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await Token.countDocuments({
    officeId,
    generatedAt: { $gte: startOfDay },
  });

  const nextSeq = countToday + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return `${prefix}-${padded}`;
};

// Helper to compute exact citizen age from Date of Birth
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// @desc    Generate a new virtual token
// @route   POST /api/tokens
// @access  Private (Citizen)
const generateToken = async (req, res, next) => {
  try {
    const { officeId, departmentId, serviceId, priority = 'NORMAL', dateOfBirth, notes = '' } = req.body;

    if (!officeId || !departmentId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Office, Department, and Service are required to generate a token.',
      });
    }

    const [office, department, service, currentUser] = await Promise.all([
      Office.findById(officeId),
      Department.findById(departmentId),
      Service.findById(serviceId),
      User.findById(req.user._id),
    ]);

    if (!office || office.status === 'closed' || office.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This government office is currently closed or under maintenance.',
      });
    }

    if (!service || service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Selected service is currently unavailable.',
      });
    }

    // Check if citizen already has an active waiting/serving token for this service
    const existingActive = await Token.findOne({
      citizenId: req.user._id,
      officeId,
      status: { $in: ['WAITING', 'APPROACHING', 'CALLED', 'SERVING'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You already have an active token (${existingActive.tokenNumber}) in this office. Please complete or cancel it first.`,
        activeToken: existingActive,
      });
    }

    // Check maximum daily token limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const tokensToday = await Token.countDocuments({
      serviceId,
      generatedAt: { $gte: startOfDay },
    });

    if (tokensToday >= (service.maxDailyTokens || 200)) {
      return res.status(400).json({
        success: false,
        message: 'Daily token limit for this service has been reached. Please book for tomorrow.',
      });
    }

    // Birth Date Verification and Senior Citizen Priority Handling
    const effectiveDob = dateOfBirth || currentUser?.dateOfBirth;
    const citizenAge = effectiveDob ? calculateAge(effectiveDob) : null;

    if (dateOfBirth && (!currentUser?.dateOfBirth || new Date(dateOfBirth).getTime() !== new Date(currentUser.dateOfBirth).getTime())) {
      await User.findByIdAndUpdate(req.user._id, {
        dateOfBirth: new Date(dateOfBirth),
        isSeniorCitizen: citizenAge !== null && citizenAge >= 60,
      });
    }

    let finalPriority = priority;
    let isSenior = false;
    let priorityScore = 0;

    if (priority === 'SENIOR_CITIZEN') {
      if (!effectiveDob) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth verification is required for Senior Citizen token (age 60+). Please provide your birth date.',
        });
      }
      if (citizenAge === null || citizenAge < 60) {
        return res.status(400).json({
          success: false,
          message: `Birth date verification failed: Age is ${citizenAge ?? 0} years. Senior citizen priority tokens are strictly reserved for individuals 60 years or older.`,
        });
      }
      isSenior = true;
      finalPriority = 'SENIOR_CITIZEN';
      priorityScore = 150;
    } else if (priority === 'SPECIALLY_ABLED') {
      finalPriority = 'SPECIALLY_ABLED';
      priorityScore = 200;
    } else if (citizenAge !== null && citizenAge >= 60) {
      // Auto-elevate senior citizens to priority queue
      isSenior = true;
      finalPriority = 'SENIOR_CITIZEN';
      priorityScore = 150;
    } else if (priority === 'PRIORITY') {
      finalPriority = 'PRIORITY';
      priorityScore = 100;
    } else {
      finalPriority = 'NORMAL';
      priorityScore = 0;
    }

    // Generate Token Number: Senior Citizen tokens get distinctive 'S' prefix
    const defaultPrefix = service.prefix || 'A';
    const prefix = isSenior ? 'S' : defaultPrefix;
    const tokenNumber = await getNextTokenNumber(officeId, prefix);

    // Generate Secure QR Code
    const { qrToken, qrDataUrl } = await generateSecureQr(`QL-${office.code}-`);

    // Calculate queue position & estimated wait time based on priority queue
    // Senior citizen tokens only queue behind other high-priority tokens
    const waitingAhead = await Token.countDocuments({
      officeId,
      serviceId,
      status: { $in: ['WAITING', 'APPROACHING'] },
      priorityScore: { $gte: priorityScore },
    });

    const activeCounters = await Counter.countDocuments({
      services: serviceId,
      status: 'active',
    });

    const duration = department?.tokenDurationMinutes || service.averageServiceTime || 10;

    const { estimatedWaitTimeMinutes, recommendedArrivalTime } = calculateWaitingTime({
      peopleAhead: waitingAhead,
      averageServiceTime: duration,
      activeCounters: Math.max(1, activeCounters),
      priority: finalPriority,
    });

    const queuePosition = waitingAhead + 1;
    const initialStatus = queuePosition <= 5 ? 'APPROACHING' : 'WAITING';

    const token = await Token.create({
      tokenNumber,
      citizenId: req.user._id,
      citizenName: req.user.name,
      citizenMobile: req.user.mobile,
      officeId,
      departmentId,
      serviceId,
      status: initialStatus,
      priority: finalPriority,
      priorityScore,
      isSeniorCitizen: isSenior,
      citizenAge: citizenAge || null,
      queuePosition,
      estimatedWaitTime: estimatedWaitTimeMinutes,
      recommendedArrivalTime,
      serviceDurationMinutes: duration,
      qrToken,
      qrDataUrl,
      notes,
      generatedAt: new Date(),
    });

    // Recalculate queue synchronously to ensure immediate global priority ordering
    await recalculateQueue(officeId, serviceId);

    // Re-fetch populated token with updated queue position
    const populatedToken = await Token.findById(token._id)
      .populate('officeId', 'name code address city state contactNumber openingTime closingTime')
      .populate('departmentId', 'name code tokenDurationMinutes')
      .populate('serviceId', 'name code averageServiceTime requiredDocuments')
      .populate('counterId', 'counterNumber');

    // Trigger Initial Notification
    await sendNotification({
      userId: req.user._id,
      tokenId: token._id,
      title: isSenior
        ? `Senior Citizen Priority Token ${tokenNumber} Confirmed`
        : `Token ${tokenNumber} Generated Successfully`,
      message: isSenior
        ? `Your Senior Citizen Priority Token ${tokenNumber} is verified and booked with expedited queue priority! Recommended arrival: ${recommendedArrivalTime}.`
        : `Your token ${tokenNumber} for ${service.name} at ${office.name} is confirmed. Queue position: ${populatedToken.queuePosition}. Estimated wait: ~${populatedToken.estimatedWaitTime} minutes. Recommended arrival: ${recommendedArrivalTime}.`,
      type: 'INFO',
    });

    res.status(201).json({
      success: true,
      message: isSenior
        ? `Senior Citizen Priority Token (${tokenNumber}) verified and generated successfully.`
        : 'Virtual token generated successfully.',
      token: populatedToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated citizen's tokens
// @route   GET /api/tokens/my
// @access  Private (Citizen)
const getMyTokens = async (req, res, next) => {
  try {
    const tokens = await Token.find({ citizenId: req.user._id })
      .populate('officeId', 'name code address city state')
      .populate('departmentId', 'name code tokenDurationMinutes')
      .populate('serviceId', 'name code averageServiceTime requiredDocuments')
      .populate('counterId', 'counterNumber status')
      .sort({ generatedAt: -1 });

    const activeToken = tokens.find((t) =>
      ['WAITING', 'APPROACHING', 'CALLED', 'SERVING'].includes(t.status)
    );

    res.status(200).json({
      success: true,
      activeToken: activeToken || null,
      tokens,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single token by ID
// @route   GET /api/tokens/:id
// @access  Public / Private
const getTokenById = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('officeId', 'name code address city state contactNumber openingTime closingTime')
      .populate('departmentId', 'name code tokenDurationMinutes')
      .populate('serviceId', 'name code averageServiceTime requiredDocuments')
      .populate('counterId', 'counterNumber status');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found.',
      });
    }

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an active token
// @route   PATCH /api/tokens/:id/cancel
// @access  Private (Citizen or Staff/Admin)
const cancelToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found.',
      });
    }

    // Only owner citizen or staff/admin can cancel
    if (
      req.user.role === 'citizen' &&
      token.citizenId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this token.',
      });
    }

    if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: `Token cannot be cancelled as it is already ${token.status.toLowerCase()}.`,
      });
    }

    token.status = 'CANCELLED';
    token.cancelledAt = new Date();
    await token.save();

    // If assigned to a counter and was called/serving, free counter
    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId, { currentToken: null });
    }

    await sendNotification({
      userId: token.citizenId,
      tokenId: token._id,
      title: `Token ${token.tokenNumber} Cancelled`,
      message: `Your token ${token.tokenNumber} has been successfully cancelled.`,
      type: 'CANCELLED',
    });

    // Recalculate queue
    await recalculateQueue(token.officeId, token.serviceId);

    emitToOffice(token.officeId.toString(), 'token_cancelled', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    res.status(200).json({
      success: true,
      message: 'Token cancelled successfully.',
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify token by secure QR code string
// @route   GET /api/tokens/verify-qr/:qrToken
// @access  Private (Staff/Admin)
const verifyTokenByQr = async (req, res, next) => {
  try {
    const { qrToken } = req.params;

    const token = await Token.findOne({ qrToken })
      .populate('officeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('serviceId', 'name code requiredDocuments averageServiceTime')
      .populate('counterId', 'counterNumber')
      .populate('citizenId', 'name email mobile');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or unknown QR token code.',
      });
    }

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateToken,
  getMyTokens,
  getTokenById,
  cancelToken,
  verifyTokenByQr,
};

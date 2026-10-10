const Token = require('../models/Token');
const Counter = require('../models/Counter');
const Service = require('../models/Service');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');
const { calculateWaitingTime } = require('./predictionService');
const { emitToOffice, emitToUser, broadcastGlobal } = require('../sockets/socketHandler');
const { sendEmailNotification } = require('../utils/emailService');

/**
 * Dispatch notification and save in DB
 */
const sendNotification = async ({ userId, tokenId = null, title, message, type = 'INFO' }) => {
  try {
    const notif = await Notification.create({
      userId,
      tokenId,
      title,
      message,
      type,
    });

    // Real-time socket notification to the citizen
    emitToUser(userId.toString(), 'new_notification', {
      id: notif._id,
      title,
      message,
      type,
      createdAt: notif.createdAt,
    });

    // Optionally send email
    const user = await User.findById(userId);
    if (user && user.email) {
      sendEmailNotification({
        to: user.email,
        subject: `[QueueLess] ${title}`,
        text: message,
        html: `<div style="font-family:sans-serif;padding:20px;color:#1e293b;">
          <h2 style="color:#1d4ed8;">QueueLess Government Office</h2>
          <p style="font-size:16px;"><strong>${title}</strong></p>
          <p style="font-size:14px;color:#475569;">${message}</p>
          <hr style="margin:20px 0;border:0;border-top:1px solid #e2e8f0;"/>
          <p style="font-size:12px;color:#94a3b8;">This is an automated notification from QueueLess Smart Virtual Queue System.</p>
        </div>`,
      });
    }

    return notif;
  } catch (err) {
    console.error('[Notification Dispatch Error]', err.message);
  }
};

/**
 * Recalculate queue positions, estimated wait times, and check notification thresholds
 */
const recalculateQueue = async (officeId, serviceId = null) => {
  try {
    const settings = (await SystemSettings.findOne()) || {
      notificationThresholdApproaching: 5,
      notificationThresholdUrgent: 2,
    };

    const filter = {
      officeId,
      status: { $in: ['WAITING', 'APPROACHING'] },
    };
    if (serviceId) {
      filter.serviceId = serviceId;
    }

    // Sort order: Priority tokens first (SPECIALLY_ABLED, SENIOR_CITIZEN, PRIORITY before NORMAL), then FCFS (generatedAt ASC)
    const tokens = await Token.find(filter)
      .populate('serviceId', 'averageServiceTime name')
      .populate('departmentId', 'tokenDurationMinutes name')
      .sort({
        priorityScore: -1,
        priority: -1,
        generatedAt: 1,
      });

    // Find active counters for this office
    const activeCountersCount = await Counter.countDocuments({
      office: officeId,
      status: 'active',
    });

    const safeCounters = Math.max(1, activeCountersCount);

    const updatedTokens = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const peopleAhead = i; // 0 for the first waiting token
      const avgDuration = token.departmentId?.tokenDurationMinutes || token.serviceId?.averageServiceTime || 10;
      token.serviceDurationMinutes = avgDuration;

      const { estimatedWaitTimeMinutes, recommendedArrivalTime } = calculateWaitingTime({
        peopleAhead,
        averageServiceTime: avgDuration,
        activeCounters: safeCounters,
        priority: token.priority,
      });

      const oldStatus = token.status;
      let newStatus = token.status;

      // Status adjustment: If within approaching threshold (e.g. <= 5 people ahead)
      if (peopleAhead < settings.notificationThresholdApproaching && token.status === 'WAITING') {
        newStatus = 'APPROACHING';
      }

      token.queuePosition = i + 1;
      token.estimatedWaitTime = estimatedWaitTimeMinutes;
      token.recommendedArrivalTime = recommendedArrivalTime;
      token.status = newStatus;

      await token.save();
      updatedTokens.push(token);

      // Trigger notification if status just changed to APPROACHING
      if (oldStatus === 'WAITING' && newStatus === 'APPROACHING') {
        await sendNotification({
          userId: token.citizenId,
          tokenId: token._id,
          title: `Your token ${token.tokenNumber} is approaching`,
          message: `Your token is approaching! There are currently ${peopleAhead} people ahead of you. Estimated wait: ~${estimatedWaitTimeMinutes} mins.`,
          type: 'APPROACHING',
        });
      }

      // Urgent notification when 2 or fewer people ahead
      if (peopleAhead <= settings.notificationThresholdUrgent && peopleAhead > 0) {
        // Only if not already sent recently
        emitToUser(token.citizenId.toString(), 'token_urgent_alert', {
          tokenNumber: token.tokenNumber,
          peopleAhead,
          estimatedWaitTime: estimatedWaitTimeMinutes,
        });
      }

      // Real-time update to citizen
      emitToUser(token.citizenId.toString(), 'token_updated', {
        tokenId: token._id,
        tokenNumber: token.tokenNumber,
        queuePosition: token.queuePosition,
        peopleAhead,
        estimatedWaitTime: token.estimatedWaitTime,
        recommendedArrivalTime: token.recommendedArrivalTime,
        status: token.status,
      });
    }

    // Broadcast queue update to office & admin monitors
    emitToOffice(officeId.toString(), 'queue_updated', {
      officeId,
      serviceId,
      totalWaiting: tokens.length,
      timestamp: new Date(),
    });

    return updatedTokens;
  } catch (error) {
    console.error('[Queue Recalculate Error]', error.message);
  }
};

module.exports = {
  recalculateQueue,
  sendNotification,
};

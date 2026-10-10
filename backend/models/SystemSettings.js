const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    tokenPrefix: {
      type: String,
      default: 'A',
    },
    maxDailyTokens: {
      type: Number,
      default: 250,
    },
    notificationThresholdApproaching: {
      type: Number,
      default: 5,
    },
    notificationThresholdUrgent: {
      type: Number,
      default: 2,
    },
    queueTimeoutMinutes: {
      type: Number,
      default: 15,
    },
    tokenExpiryHours: {
      type: Number,
      default: 12,
    },
    announcementTicker: {
      type: String,
      default: 'Welcome to QueueLess. Arrive 10 minutes prior to your predicted turn.',
    },
    allowPriorityBooking: {
      type: Boolean,
      default: true,
    },
    autoRecallLimit: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

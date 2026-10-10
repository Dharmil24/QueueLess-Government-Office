const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: [true, 'Token number is required'],
      trim: true,
      index: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    citizenName: {
      type: String,
      default: '',
    },
    citizenMobile: {
      type: String,
      default: '',
    },
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Office',
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null,
    },
    status: {
      type: String,
      enum: ['WAITING', 'APPROACHING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED', 'CANCELLED', 'EXPIRED'],
      default: 'WAITING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'PRIORITY', 'SENIOR_CITIZEN', 'SPECIALLY_ABLED'],
      default: 'NORMAL',
    },
    priorityScore: {
      type: Number,
      default: 0,
      index: true,
    },
    isSeniorCitizen: {
      type: Boolean,
      default: false,
    },
    citizenAge: {
      type: Number,
      default: null,
    },
    queuePosition: {
      type: Number,
      default: 1,
    },
    estimatedWaitTime: {
      type: Number, // in minutes
      default: 0,
    },
    recommendedArrivalTime: {
      type: String, // e.g. "10:45 AM"
      default: '',
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    qrDataUrl: {
      type: String,
      default: '',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    serviceStartedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    serviceDurationMinutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    recalledCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying active tokens per office/service on a given day
tokenSchema.index({ officeId: 1, serviceId: 1, status: 1, generatedAt: -1 });

module.exports = mongoose.model('Token', tokenSchema);

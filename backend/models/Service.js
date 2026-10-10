const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Service code is required'],
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Office',
      required: [true, 'Office is required'],
    },
    description: {
      type: String,
      default: '',
    },
    averageServiceTime: {
      type: Number,
      required: [true, 'Average service time in minutes is required'],
      default: 10,
    },
    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],
    maxDailyTokens: {
      type: Number,
      default: 200,
    },
    prefix: {
      type: String,
      default: 'A',
      uppercase: true,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);

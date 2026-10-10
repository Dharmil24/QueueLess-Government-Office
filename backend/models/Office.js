const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Office name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Office code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN Code is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 22.3039,
    },
    longitude: {
      type: Number,
      default: 70.8022,
    },
    contactNumber: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    openingTime: {
      type: String,
      default: '09:00',
    },
    closingTime: {
      type: String,
      default: '17:00',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'holiday', 'maintenance'],
      default: 'open',
    },
    holidays: [
      {
        date: { type: Date },
        title: { type: String },
      },
    ],
    announcement: {
      type: String,
      default: 'Welcome to QueueLess Smart Citizen Service Counter.',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for departments associated with this office
officeSchema.virtual('departments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'office',
});

module.exports = mongoose.model('Office', officeSchema);

const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  maxBookings: {
    type: Number,
    default: 1,
  },
  currentBookings: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexing  for efficient queries
timeSlotSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model("TimeSlot", timeSlotSchema);

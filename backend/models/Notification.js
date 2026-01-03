const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["booking", "reminder", "cancellation", "general"],
    default: "general",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

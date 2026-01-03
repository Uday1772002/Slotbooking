const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeSlot",
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexing for efficient queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ slotId: 1 });
// unique index to prevent duplicate bookings (user + slot + active status)
bookingSchema.index(
  { userId: 1, slotId: 1, status: 1 },
  {
    unique: true,
    //$ne means not equals to
    partialFilterExpression: { status: { $ne: "cancelled" } },
  }
);

module.exports = mongoose.model("Booking", bookingSchema);

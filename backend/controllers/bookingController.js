const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");
const Notification = require("../models/Notification");

const createBooking = async (req, res) => {
  try {
    const { slotId, notes } = req.body;

    const slot = await TimeSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    if (slot.createdBy === req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Can't book your own slot",
      });
    }

    if (!slot.isAvailable || slot.currentBookings >= slot.maxBookings) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    // Check if user already has a booking for this slot
    const existingBooking = await Booking.findOne({
      userId: req.user.uid,
      slotId,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Already booked this slot",
      });
    }

    const booking = new Booking({
      userId: req.user.uid,
      slotId,
      phoneNumber: req.user.phoneNumber,
      notes: notes || "",
    });

    await booking.save();

    // update slot count
    slot.currentBookings += 1;
    if (slot.currentBookings >= slot.maxBookings) {
      slot.isAvailable = false;
    }
    await slot.save();

    await Notification.create({
      userId: req.user.uid,
      title: "Booking Confirmed",
      message:
        "Booked for " +
        new Date(slot.date).toLocaleDateString() +
        " at " +
        slot.startTime,
      type: "booking",
      relatedBookingId: booking._id,
    });

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking for this time slot",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.uid })
      .populate("slotId")
      .sort({ createdAt: -1 });

    // Filter out bookings where slot was deleted
    const validBookings = bookings.filter((booking) => booking.slotId !== null);

    res.json({
      success: true,
      count: validBookings.length,
      bookings: validBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("slotId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking belongs to user
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking belongs to user
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Update slot availability
    const slot = await TimeSlot.findById(booking.slotId);
    if (slot) {
      slot.currentBookings -= 1;
      slot.isAvailable = true;
      await slot.save();
    }

    // Create notification
    await Notification.create({
      userId: req.user.uid,
      title: "Booking Cancelled",
      message: "Your booking has been cancelled successfully.",
      type: "cancellation",
      relatedBookingId: booking._id,
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get bookings for provider's slots (for providers to see who booked their slots)
const getProviderBookings = async (req, res) => {
  try {
    // Get all slots created by this provider
    const providerSlots = await TimeSlot.find({ createdBy: req.user.uid });
    const slotIds = providerSlots.map((slot) => slot._id);

    // Get all bookings for these slots
    const bookings = await Booking.find({
      slotId: { $in: slotIds },
      status: { $ne: "cancelled" },
    })
      .populate("slotId")
      .populate("userId", "name phoneNumber")
      .sort({ createdAt: -1 });

    // Filter out bookings where slot was deleted
    const validBookings = bookings.filter((booking) => booking.slotId !== null);

    res.json({
      success: true,
      count: validBookings.length,
      bookings: validBookings,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getProviderBookings,
};

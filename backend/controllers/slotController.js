const TimeSlot = require("../models/TimeSlot");
const Booking = require("../models/Booking");

const doTimeSlotsOverlap = (start1, end1, start2, end2) => {
  const timeToMinutes = (time) => {
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
};

const createTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, maxBookings } = req.body;

    const timeToMinutes = (time) => {
      const [timePart, period] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const existingSlots = await TimeSlot.find({ date });

    for (const existing of existingSlots) {
      if (
        doTimeSlotsOverlap(
          startTime,
          endTime,
          existing.startTime,
          existing.endTime
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Time slot conflicts with existing slot: ${existing.startTime} - ${existing.endTime}`,
        });
      }
    }

    const slot = new TimeSlot({
      date,
      startTime,
      endTime,
      maxBookings: maxBookings || 1,
      createdBy: req.user.uid,
    });

    await slot.save();

    res.status(201).json({
      success: true,
      message: "Slot created",
      slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Getting available slots
const getAvailableSlots = async (req, res) => {
  try {
    const { date, startDate, endDate, showAll } = req.query;

    let query = {};

    // If not showAll, only show available slots (for customers)
    if (showAll !== "true") {
      query.isAvailable = true;
    }

    // If user is authenticated and showAll is true, filter by createdBy
    if (showAll === "true" && req.user) {
      query.createdBy = req.user.uid;
    }

    if (date) {
      query.date = date;
    }

    const slots = await TimeSlot.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get slot by ID
const getSlotById = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    res.json({
      success: true,
      slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update time slot
const updateTimeSlot = async (req, res) => {
  try {
    const { isAvailable, maxBookings } = req.body;

    const slot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { isAvailable, maxBookings },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    res.json({
      success: true,
      message: "Time slot updated successfully",
      slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete time slot
const deleteTimeSlot = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    if (slot.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own slots",
      });
    }

    const hasBookings = await Booking.findOne({
      slotId: req.params.id,
      status: { $in: ["confirmed", "pending"] },
    });

    if (hasBookings) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete slot with active bookings. Cancel bookings first.",
      });
    }

    await TimeSlot.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTimeSlot,
  getAvailableSlots,
  getSlotById,
  updateTimeSlot,
  deleteTimeSlot,
};

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  checkProviderRole,
  checkCustomerRole,
} = require("../middleware/roleMiddleware");
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getProviderBookings,
} = require("../controllers/bookingController");

// All booking routes need authentication
router.use(verifyToken);

// Provider sees all bookings for their slots
router.get("/provider/bookings", checkProviderRole, getProviderBookings);

// User sees their own bookings
router.get("/", getUserBookings);
router.get("/:id", getBookingById);

// Customers can create bookings
router.post("/", checkCustomerRole, createBooking);

// Cancel booking
router.patch("/:id/cancel", cancelBooking);

module.exports = router;

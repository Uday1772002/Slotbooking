const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getProviderBookings,
} = require("../controllers/bookingController");

router.use(verifyToken);

router.get("/provider/bookings", requireRole("provider"), getProviderBookings);
router.get("/", getUserBookings);
router.get("/:id", getBookingById);

router.post(
  "/",
  requireRole("customer"),
  [
    body("slotId").notEmpty().withMessage("Slot ID is required"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],
  validate,
  createBooking
);

router.patch("/:id/cancel", cancelBooking);

module.exports = router;

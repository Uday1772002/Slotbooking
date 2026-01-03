const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  createTimeSlot,
  getAvailableSlots,
  getSlotById,
  updateTimeSlot,
  deleteTimeSlot,
} = require("../controllers/slotController");

// Public routes
router.get("/", getAvailableSlots);
router.get("/:id", getSlotById);

// Protected routes - Provider only

router.post(
  "/",
  verifyToken,
  requireRole("provider"),
  [
    body("date").isISO8601().withMessage("Valid date is required"),
    body("startTime").notEmpty().withMessage("Start time is required"),
    body("endTime").notEmpty().withMessage("End time is required"),
    body("maxBookings")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max bookings must be at least 1"),
  ],
  validate,
  createTimeSlot
);

router.put(
  "/:id",
  verifyToken,
  requireRole("provider"),
  [
    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage("isAvailable must be a boolean"),
    body("maxBookings")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max bookings must be at least 1"),
  ],
  validate,
  updateTimeSlot
);

router.delete("/:id", verifyToken, requireRole("provider"), deleteTimeSlot);

module.exports = router;

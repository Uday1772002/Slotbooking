const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { checkProviderRole } = require("../middleware/roleMiddleware");
const {
  createTimeSlot,
  getAvailableSlots,
  getSlotById,
  updateTimeSlot,
  deleteTimeSlot,
} = require("../controllers/slotController");

// Public routes - anyone can view slots
router.get("/", getAvailableSlots);
router.get("/:id", getSlotById);

// Protected routes - only providers can manage slots
router.post("/", verifyToken, checkProviderRole, createTimeSlot);
router.put("/:id", verifyToken, checkProviderRole, updateTimeSlot);
router.delete("/:id", verifyToken, checkProviderRole, deleteTimeSlot);

module.exports = router;

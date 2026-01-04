const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

// Login with Firebase token
router.post("/login", login);

// Register new user
router.post("/register", registerUser);

// Get user profile (protected)
router.get("/profile", verifyToken, getUserProfile);

// Update user profile (protected)
router.put("/profile", verifyToken, updateUserProfile);

module.exports = router;

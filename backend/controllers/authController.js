const User = require("../models/User");
const Notification = require("../models/Notification");
const { admin } = require("../config/firebase");
const { isValidPhone } = require("../middleware/validationMiddleware");

// Login with Firebase token
const login = async (req, res) => {
  try {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    // Check if user already exists
    let user = await User.findOne({ uid });

    // Set token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    if (user) {
      return res.json({
        success: true,
        message: "Login successful",
        user,
      });
    }

    // New user needs to register
    return res.json({
      success: true,
      message: "New user, please complete registration",
      user: null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { uid, phoneNumber, name, role } = req.body;

    // Validate required fields
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ message: "Invalid phone number format. Use +91XXXXXXXXXX" });
    }

    // Check if user already exists
    let user = await User.findOne({ uid });
    if (user) {
      return res.json({
        success: true,
        message: "User already registered",
        user,
      });
    }

    // Validate role
    if (!role || !["provider", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be either provider or customer" });
    }

    // Check if phone number already in use
    const existingPhone = await User.findOne({ phoneNumber: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Create new user
    user = new User({
      uid,
      phoneNumber: cleanPhone,
      name: name || "",
      role,
    });
    await user.save();

    // Send welcome notification
    await Notification.create({
      userId: uid,
      title: "Welcome!",
      message:
        role === "provider"
          ? "You can now create time slots for your services"
          : "Browse and book available time slots",
      type: "general",
    });

    res.json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get logged in user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name if provided
    if (name && name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { name: name ? name.trim() : undefined },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
};

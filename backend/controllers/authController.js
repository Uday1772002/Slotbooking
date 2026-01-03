const User = require("../models/User");
const Notification = require("../models/Notification");
const { admin } = require("../config/firebase");

const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    let user = await User.findOne({ uid });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    if (user) {
      return res.json({
        success: true,
        message: "Authenticated",
        user,
      });
    }

    return res.json({
      success: true,
      message: "New user, needs registration",
      user: null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { uid, phoneNumber, name, role } = req.body;

    console.log("Register attempt:", uid, phoneNumber, role);

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    let user = await User.findOne({ uid });

    if (user) {
      console.log("User exists:", uid);
      return res.json({
        success: true,
        message: "Authenticated",
        user,
      });
    }

    if (!role || !["provider", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role required",
      });
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    user = new User({
      uid,
      phoneNumber,
      name: name || "",
      role,
    });
    await user.save();

    console.log("New user:", uid, role);

    await Notification.create({
      userId: uid,
      title: "Welcome!",
      message:
        role === "provider"
          ? "You can now create time slots for your services."
          : "Browse and book available slots.",
      type: "general",
    });

    res.json({
      success: true,
      message: "User created",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { name },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
};

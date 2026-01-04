const User = require("../models/User");

// Check if user has provider role
const checkProviderRole = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "Only providers can access this" });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if user has customer role
const checkCustomerRole = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can access this" });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkProviderRole, checkCustomerRole };

const User = require("../models/User");

// Check if user has specific role
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ uid: req.user.uid });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This action requires ${allowedRoles.join(
            " or "
          )} role.`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { requireRole };

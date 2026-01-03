const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation failed:", errors.array()[0].msg);
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validate };

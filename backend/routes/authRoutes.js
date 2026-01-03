const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { verifyToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

router.post(
  "/login",
  [body("token").notEmpty().withMessage("Token is required")],
  validate,
  login
);

router.post(
  "/register",
  [
    body("uid").notEmpty().withMessage("UID is required"),
    body("phoneNumber")
      .notEmpty()
      .customSanitizer((value) => value.replace(/\s+/g, ""))
      .matches(/^\+91[6-9]\d{9}$/)
      .withMessage("Invalid phone number"),
  ],
  validate,
  registerUser
);

router.get("/profile", verifyToken, getUserProfile);

router.put(
  "/profile",
  verifyToken,
  [body("name").optional().isLength({ min: 2 }).withMessage("Name too short")],
  validate,
  updateUserProfile
);

module.exports = router;

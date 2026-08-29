const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
} = require("../controllers/authController");

router.post("/register", register);

// Support both endpoint conventions
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-otp", verifyEmailOtp);

router.post("/resend-email-otp", resendEmailOtp);
router.post("/resend-otp", resendEmailOtp);

router.post("/login", login);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.post("/login", login);

module.exports = router;
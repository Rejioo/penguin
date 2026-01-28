const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// Register
router.post("/register", authController.register);

// Login – step 1 (password check + OTP send)
router.post("/login-step1", authController.loginStep1);

// Login – step 2 (OTP verify + JWT)
router.post("/login-step2", authController.loginStep2);

// Verify OTP (registration)
router.post("/verify-otp", authController.verifyOtp);

// Resend registration OTP
router.post("/resend-register-otp", authController.resendRegisterOtp);

module.exports = router;

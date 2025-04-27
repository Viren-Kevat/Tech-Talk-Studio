const express = require("express");
const {
  registerUser,
  loginUser,
  updatePassword,
} = require("../controller/authController");
const router = express.Router();

// ✅ Register a new user
router.post("/register", registerUser);

// ✅ Login and generate JWT token
router.post("/login", loginUser);

// ✅ Update password
router.post("/update-password", updatePassword);

module.exports = router;

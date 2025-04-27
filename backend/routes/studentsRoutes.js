const express = require("express");
const router = express.Router();
const { getUserProfileByUsername } = require("../controller/studentController");

// ✅ Get user profile by username
router.get("/:username", getUserProfileByUsername);

module.exports = router;

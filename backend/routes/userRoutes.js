const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// Get logged-in user by email
router.get("/loggedinuser", userController.getLoggedInUser);

// Fetch tweets by Firebase UID
router.get("/:firebaseUid/tweets", userController.getTweetsByFirebaseUid);

// Get user by Firebase UID
router.get("/:firebaseUid", userController.getUserByFirebaseUid);

// Get user profile by username
router.get("/username/:username", userController.getUserProfileByUsername);

// Search users by username
router.get("/search", userController.searchUsersByUsername);

// Update User
router.put("/:firebaseUid", userController.updateUser);

// Find user by username
router.post("/find", userController.findUserByUsername);

module.exports = router;

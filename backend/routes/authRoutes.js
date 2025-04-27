const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import JWT
const User = require("../model/User");
const router = express.Router();

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Register a new user
router.post("/register", async (req, res) => {
  try {
    const {
      uid,
      username,
      email,
      password,
      displayName,
      avatar,
      mobileNumber,
    } = req.body;

    console.log("Registration request:", req.body);

    // Validate required fields
    if (!uid || !username || !email || !displayName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for duplicate email or UID
    const [existingEmail, existingUid] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }),
      User.findOne({ firebaseUid: uid }),
    ]);

    if (existingEmail) return res.status(400).json({ error: "Email exists" });
    if (existingUid) return res.status(400).json({ error: "User exists" });

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : "";

    // Create the new user
    const newUser = await User.create({
      firebaseUid: uid,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      displayName: displayName.trim(),
      avatar: avatar || "",
      mobileNumber: mobileNumber || "",
    });

    res.status(201).json({ message: "User registered", userId: newUser._id });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate key violation" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ Login and generate JWT token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiration time
    );

    res.status(200).json({
      token, // Return the token to the client
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        mobileNumber: user.mobileNumber, // Include mobile number in response
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  }
});

// ✅ Update password
router.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate input
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email and new password are required" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

module.exports = router;

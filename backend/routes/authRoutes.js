const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import JWT
const sgMail = require("@sendgrid/mail"); // Import SendGrid
const User = require("../model/User");
const router = express.Router();

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    console.log("Received data for registration:", req.body);

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

    console.log("Creating new user with data:", {
      firebaseUid: uid,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      displayName: displayName.trim(),
      avatar: avatar || "",
      mobileNumber: mobileNumber || "",
    });

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

    console.log("User created successfully:", newUser);

    // Send a welcome email
    const msg = {
      to: email.toLowerCase().trim(), // Recipient's email
      from: process.env.SENDGRID_EMAIL, // Verified sender email
      subject: "Welcome to Tech-Talk Studio! Your Journey Begins Here.",
      text: `Hi ${displayName},\n\nWelcome to Tech-Talk Studio! We're thrilled to have you join our community of innovators and tech enthusiasts. Whether you're here to learn, share, or collaborate, there's so much to explore. Here's to a great journey ahead!\n\nStart exploring your dashboard now and get the most out of our platform.\n\nIf you have any questions or need assistance, feel free to reach out to our support team anytime.\n\nBest regards,\nThe Tech-Talk Studio Team`,
      html: `
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/drvorvgeg/image/upload/v1745765703/ioajkfqpeezqttqcl22b.png" alt="Tech-Talk Studio Logo" style="width: 150px; margin-bottom: 20px;" />
      </div>
      <strong>Hi ${displayName},</strong><br><br>
      <p>Welcome to <strong>Tech-Talk Studio</strong>! We're thrilled to have you join our community of innovators and tech enthusiasts. Whether you're here to learn, share, or collaborate, there's so much to explore. Here's to a great journey ahead!</p>
      <p><strong>Get Started:</strong> <a href="YOUR_DASHBOARD_URL" style="color: #2d3436; font-weight: bold;">Start exploring your dashboard</a> and unlock the full potential of our platform.</p>
      <p>If you have any questions or need assistance, feel free to reach out to our <a href="YOUR_SUPPORT_URL" style="color: #2d3436; font-weight: bold;">support team</a> anytime. We're here to help!</p>
      <br><br>
      <p>Best regards,<br>The <strong>Tech-Talk Studio Team</strong></p>
      <footer style="font-size: 0.8rem; color: #636e72;">
        <p>If you did not sign up for Tech-Talk Studio, you can ignore this email.</p>
      </footer>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const sgMail = require("@sendgrid/mail"); // Import SendGrid

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // You will store this in your .env file

const JWT_SECRET = process.env.JWT_SECRET;

// Function to send a welcome email
const sendWelcomeEmail = (userEmail, userName) => {
  const msg = {
    to: userEmail, // Recipient's email
    from: "your-email@yourdomain.com", // Your registered SendGrid email
    subject: "Welcome to Tech-Talk Studio!",
    text: `Hello ${userName},\n\nWelcome to Tech-Talk Studio! We're thrilled to have you here. Start exploring and join the conversation!\n\nBest regards,\nThe Tech-Talk Studio Team`,
    html: `<p>Hello <strong>${userName}</strong>,</p><p>Welcome to <strong>Tech-Talk Studio</strong>! We're thrilled to have you here. Start exploring and join the conversation!</p><p>Best regards,<br>The Tech-Talk Studio Team</p>`,
  };

  // Send email
  return sgMail.send(msg);
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const {
      uid,
      username,
      email,
      password,
      displayName,
      avatar,
      mobileNumber,
      dob,
      collegeName,
      branch,
      location,
      website,
      bio,
    } = req.body;

    console.log("Registration request:", req.body);

    if (!uid || !username || !email || !displayName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [existingEmail, existingUid] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }),
      User.findOne({ firebaseUid: uid }),
    ]);

    if (existingEmail)
      return res.status(400).json({ error: "Email already exists" });
    if (existingUid)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : "";

    const newUser = await User.create({
      firebaseUid: uid,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      displayName: displayName.trim(),
      avatar: avatar || "",
      mobileNumber: mobileNumber || "",
      dob: dob || null,
      collegeName: collegeName || "",
      branch: branch || "",
      location: location || "",
      website: website || "",
      bio: bio || "",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });

    // Send welcome email
    sendWelcomeEmail(email.toLowerCase().trim(), displayName.trim())
      .then(() => {
        console.log("Welcome email sent successfully");
      })
      .catch((error) => {
        console.error("Error sending welcome email:", error);
      });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate key violation" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login and generate JWT token
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        mobileNumber: user.mobileNumber,
        collegeName: user.collegeName,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email and new password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  sendWelcomeEmail, // Exporting the sendWelcomeEmail function
};

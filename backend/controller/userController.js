const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const Tweet = require("../model/Tweet");

// Get logged-in user by email
exports.getLoggedInUser = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch tweets by Firebase UID
exports.getTweetsByFirebaseUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tweets = await Tweet.find({ user: user._id })
      .populate("user", "displayName username avatar")
      .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user by Firebase UID
exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({ firebaseUid }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user profile by username
exports.getUserProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search users by username
exports.searchUsersByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ error: "Username query parameter is required" });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).select("username displayName avatar");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { firebaseUid } = req.params;
  const updatedData = req.body;

  try {
    const allowedUpdates = [
      "displayName",
      "username",
      "email",
      "avatar",
      "bio",
      "location",
      "website",
      "dob",
      "mobileNumber",
      "collegeName",
      "course",
      "yearOfStudy",
      "graduationYear",
      "skills",
      "linkedinProfile",
      "githubProfile",
      "personalWebsite",
    ];
    const updates = Object.keys(updatedData);

    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    const user = await User.findOneAndUpdate({ firebaseUid }, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Find user by username
exports.findUserByUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username }).select(
      "username displayName avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

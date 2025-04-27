const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: "" },
    displayName: { type: String, required: true },
    avatar: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },

    // Academic/Professional Fields
    collegeName: { type: String, default: "" },
    course: { type: String, default: "" }, // e.g., B.Tech IT, M.Sc CS
    yearOfStudy: { type: Number, default: null }, // e.g., 1, 2, 3, 4
    graduationYear: { type: Number, default: null }, // e.g., 2025
    skills: { type: [String], default: [] }, // e.g., ["JavaScript", "Python"]
    bio: { type: String, default: "" }, // Short about me section
    linkedinProfile: { type: String, default: "" },
    githubProfile: { type: String, default: "" },
    personalWebsite: { type: String, default: "" },

    // Additional Fields
    dob: { type: Date, default: null },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

// Optional: Customize JSON output to exclude sensitive fields
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

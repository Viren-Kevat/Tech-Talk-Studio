const mongoose = require("mongoose");
const User = require("./User"); // Assuming you have a User model
const Tweet = require("./Tweet"); // Assuming you have a Tweet model
const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet", // Reference to the Tweet model
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);

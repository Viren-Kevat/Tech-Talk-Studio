const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firebaseUserId: { type: String, required: true }, // 👈 Add this line
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: String, // Store Firebase UID directly as a string
      },
    ],
    retweets: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    isRetweet: { type: Boolean, default: false },
    retweetedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Tweet", tweetSchema);

const express = require("express");
const cloudinary = require("../service/cloudinary");
const auth = require("../middleware/auth");
const {
  toggleLike,
  uploadImage,
  addTweet,
  updateTweet,
  getAllTweets,
  deleteTweet, // Add the new controller function
} = require("../controller/tweetController");
require("dotenv").config();

const router = express.Router();
// Add delete route here
router.delete("/:id", auth, deleteTweet);
// ✅ Toggle Like for a Tweet
router.patch("/:id/like", auth, toggleLike);

// ✅ Upload Image Directly to Cloudinary
router.post("/upload", uploadImage);

// ✅ Add Tweet
router.post("/addtweets", addTweet);

// ✅ Get All Tweets
router.get("/tweets", getAllTweets);

// ✅ Update Tweet by ID (Only by the user who created it)
router.put("/updatetweet/:id", auth, updateTweet);

// ✅ Delete Tweet (only by the user who created it)

module.exports = router;

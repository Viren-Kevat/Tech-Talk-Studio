const Tweet = require("../model/Tweet");
const cloudinary = require("../service/cloudinary");
const User = require("../model/User");

// ✅ Toggle Like for a Tweet
exports.toggleLike = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user.user_id || req.user.sub || req.user.firebaseUid; // Firebase UID from the request

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const hasLiked = tweet.likes.includes(userId);

    if (hasLiked) {
      tweet.likes = tweet.likes.filter((id) => id !== userId);
    } else {
      tweet.likes.push(userId);
    }

    await tweet.save();

    res.json({
      message: hasLiked ? "Like removed" : "Liked!",
      likesCount: tweet.likes.length,
      likedByUser: !hasLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// ✅ Update Tweet by ID (Only by the user who created it)
exports.updateTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { text, image } = req.body; // Get image from request body
    const firebaseUserId = req.user.firebaseUid;

    // Validate input
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Tweet content cannot be empty" });
    }

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    // Ensure the user is authorized
    if (tweet.firebaseUserId !== firebaseUserId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own tweets" });
    }

    // Update tweet text and image (if provided)
    tweet.text = text;
    if (typeof image === "string") {
      tweet.image = image; // update image only if passed
    }

    await tweet.save();

    res.status(200).json({ message: "Tweet updated successfully", tweet });
  } catch (error) {
    console.error("Error updating tweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Upload Image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log("📩 Upload request received");

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const image = req.files.image;
    console.log(`🔄 Received image: ${image.name} (${image.size} bytes)`);

    // Free-tier size limit check (10 MB)
    const MAX_FREE_IMAGE_SIZE = 10 * 1024 * 1024;
    if (image.size > MAX_FREE_IMAGE_SIZE) {
      return res.status(400).json({
        message: `Please upload an image smaller than ${
          MAX_FREE_IMAGE_SIZE / (1024 * 1024)
        } MB as per free-plan limits.`,
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "tweets",
      resource_type: "image",
      quality: "auto:low",
    });

    console.log("✅ Upload Successful:", uploadResult.secure_url);
    res.status(200).json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Upload Failed:", error);

    // Handle oversize errors explicitly
    if (error.http_code === 400 && /size.*exceeds/i.test(error.message)) {
      return res.status(400).json({
        message:
          "Upload failed: please use an image under 10 MB for the free tier.",
      });
    }

    // Other errors
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// ✅ Add Tweet
exports.addTweet = async (req, res) => {
  try {
    const { user: firebaseUid, text, image } = req.body;

    if (!firebaseUid || !text) {
      return res
        .status(400)
        .json({ message: "User ID and text are required." });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found." });

    const newTweet = new Tweet({
      user: user._id,
      firebaseUserId: firebaseUid, // <--- Save Firebase UID too
      text,
      image: image || null,
    });

    await newTweet.save();

    res
      .status(201)
      .json({ message: "Tweet posted successfully", tweet: newTweet });
  } catch (error) {
    console.error("❌ Server error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
// ✅ Delete Tweet by ID (Only by the user who created it)

exports.deleteTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const firebaseUserId = req.user.firebaseUid; // Firebase UID from the request

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    // If the tweet does not exist
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    // Check if the tweet's firebaseUserId matches the current user's firebaseUserId
    if (tweet.firebaseUserId !== firebaseUserId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own tweets" });
    }

    // Delete the tweet
    await Tweet.deleteOne({ _id: tweetId });

    res.status(200).json({ message: "Tweet deleted successfully" });
  } catch (error) {
    console.error("Error deleting tweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get All Tweets
exports.getAllTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 }); // Sort by `createdAt` in descending order

    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

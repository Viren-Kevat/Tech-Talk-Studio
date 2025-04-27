const Comment = require("../model/Comment");
const User = require("../model/User");
const Tweet = require("../model/Tweet");

// Add a new comment
async function addComment(req, res) {
  try {
    const { postId, text } = req.body;
    const firebaseUid = req.user.user_id || req.user.sub;

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: req.user.email,
        username: req.user.email.split("@")[0],
        displayName: req.user.email.split("@")[0],
      });
    }

    const tweet = await Tweet.findById(postId);
    if (!tweet) return res.status(404).json({ message: "Post not found" });

    const newComment = new Comment({
      postId,
      user: user._id,
      text,
    });

    await newComment.save();
    await newComment.populate("user", "username avatar displayName verified");

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Comment post error:", err);
    res.status(500).json({ message: "Failed to post comment" });
  }
}

// Get comments for a post
async function getComments(req, res) {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("user", "_id username avatar displayName verified")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
}

// Edit a comment
async function editComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.populate("user", "_id username avatar displayName verified");

    res.status(200).json(comment);
  } catch (err) {
    console.error("Edit comment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete a comment
async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const firebaseUid = req.user.user_id || req.user.sub;
    const user = await User.findOne({ firebaseUid });

    if (!user || comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  addComment,
  getComments,
  editComment,
  deleteComment,
};

const express = require("express");
const router = express.Router();
const auth = require("../middleware/comentAuth");
const commentController = require("../controller/commentController");

// POST /api/comments/add
router.post("/add", auth, commentController.addComment);

// GET /api/comments/:postId
router.get("/:postId", commentController.getComments);

// PATCH /api/comments/:id
router.patch("/:id", commentController.editComment);

// DELETE /api/comments/:id
router.delete("/:id", auth, commentController.deleteComment);

module.exports = router;

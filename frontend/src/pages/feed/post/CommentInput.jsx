// src/components/CommentInput.jsx
import React, { useState } from "react";
import "./CommentInput.css"; // Adjust the path as necessary

const CommentInput = ({ postId, onCommentAdded, authToken }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: comment, postId }),
        }
      );

      if (!res.ok) throw new Error("Failed to post comment");

      const newComment = await res.json();
      onCommentAdded(newComment);
      setComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  return (
    <form className="comment-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CommentInput;

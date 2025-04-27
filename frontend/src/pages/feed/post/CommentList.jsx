import React, { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { formatDistanceToNow, isValid } from "date-fns";
import { useUserAuth } from "../../../context/Userauthcontext";
import "./CommentList.css";

const CommentList = memo(({ postId, refreshTrigger }) => {
  const { currentUserId, authToken } = useUserAuth();
  const [mongoUserId, setMongoUserId] = useState(null);
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    const fetchMongoUserId = async () => {
      if (currentUserId && currentUserId.length > 20) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}`
          );
          if (res.ok) {
            const data = await res.json();
            setMongoUserId(data._id);
          } else {
            console.error("Failed to fetch MongoDB user ID");
          }
        } catch (err) {
          console.error("Error fetching MongoDB user ID:", err);
        }
      } else {
        setMongoUserId(currentUserId);
      }
    };

    fetchMongoUserId();
  }, [currentUserId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/comments/${postId}`
        );
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Fetch comments error:", err);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);

  const handleEditClick = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedText(currentText);
  };

  const handleSaveClick = async (commentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: editedText }),
        }
      );
      const updated = await res.json();
      setComments((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setEditingCommentId(null);
      setEditedText("");
    } catch (err) {
      console.error("Edit comment error:", err);
    }
  };

  const handleDeleteClick = async (commentId) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  return (
    <div className="comment-list">
      {comments.map(({ _id, user, createdAt, text }) => {
        const isOwner = String(mongoUserId).trim() === String(user?._id).trim();

        return (
          <div key={_id} className="comment-item">
            <div className="comment-header">
              <Link
                to={`/profile/${user?.username}`}
                className="comment-avatar"
              >
                <img
                  src={user?.avatar || "https://example.com/default-avatar.jpg"}
                  alt={user?.displayName || "User"}
                />
                {user?.verified && <FaCheckCircle className="verified-icon" />}
              </Link>

              <div className="comment-user-info">
                <h4>
                  <Link
                    to={`/profile/${user?.username}`}
                    className="display-name"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {user?.displayName || user?.username || "Unknown User"}
                  </Link>
                  {user?.verified && (
                    <FaCheckCircle className="inline-verified-icon" />
                  )}
                </h4>
                <p className="username">@{user?.username || "user"}</p>
                <span className="timestamp">
                  {isValid(new Date(createdAt))
                    ? `${formatDistanceToNow(new Date(createdAt))} ago`
                    : ""}
                </span>
              </div>

              {isOwner && (
                <div className="comment-actions">
                  <button
                    onClick={() =>
                      editingCommentId === _id
                        ? handleSaveClick(_id)
                        : handleEditClick(_id, text)
                    }
                  >
                    {editingCommentId === _id ? <FaSave /> : <FaEdit />}
                  </button>
                  <button onClick={() => handleDeleteClick(_id)}>
                    <FaTrashAlt />
                  </button>
                </div>
              )}
            </div>

            <div className="comment-content">
              {editingCommentId === _id ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="comment-textarea"
                />
              ) : (
                <p>{text}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default CommentList;

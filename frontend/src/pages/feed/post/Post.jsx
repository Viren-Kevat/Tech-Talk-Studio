import React, { useState, useEffect } from "react";
import {
  FaRegComment,
  FaRetweet,
  FaRegHeart,
  FaHeart,
  FaShareSquare,
  FaCheckCircle,
  FaTrashAlt,
  FaEdit,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../../context/Userauthcontext";
import userLoggedinuser from "../../../hooks/userLoggedinuser";
import EditTweetModal from "../../../components/EditTweetModal";
import CommentInput from "../post/CommentInput";
import CommentList from "../post/CommentList";
import "./Post.css";

function Post({ data = {}, onDelete, onEdit }) {
  const { t } = useTranslation();
  const { authToken } = useUserAuth();
  const [loggedinuser] = userLoggedinuser();

  const {
    user = {},
    text = "",
    image = "",
    createdAt = "",
    likes = [],
    retweets = 0,
    replies = 0,
    isRetweet = false,
    retweetedBy = "",
    _id,
    firebaseUserId,
  } = data;

  const [liked, setLiked] = useState(likes.includes(loggedinuser?._id));
  const [likeCount, setLikeCount] = useState(likes.length);
  const [replyCount, setReplyCount] = useState(replies || 0);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);

  const isValidDate = (date) => !isNaN(Date.parse(date));
  const displayName = user?.username || "Unknown User";
  const username = user?.username || "unknown_user";
  const avatar = user?.avatar || "https://example.com/default-avatar.jpg";

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/comments/${_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data); // Update comments state
      } catch (err) {
        console.error("Fetch comments error:", err);
      }
    };

    fetchComments(); // Fetch comments on page load
  }, [_id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/comments/${_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Fetch comments error:", err);
      }
    };

    if (showComments) {
      fetchComments();
    }
  }, [_id, showComments, refreshComments]);

  useEffect(() => {
    if (loggedinuser) {
      // console.log("Likes array:", likes);
      // console.log(
      //   "Logged-in user ID:",
      //   loggedinuser?.firebaseUid || loggedinuser?._id
      // );
      setLiked(likes.includes(loggedinuser?.firebaseUid || loggedinuser?._id));
    }
  }, [likes, loggedinuser]);

  const handleLike = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tweets/${_id}/like`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to toggle like");

      const result = await res.json();
      setLiked(result.likedByUser);
      setLikeCount(result.likesCount);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this tweet?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tweets/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete tweet");
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete tweet");
    }
  };

  return (
    <>
      <div className={`post ${isRetweet ? "post--retweet" : ""}`}>
        {isRetweet && (
          <div className="post__retweet-label">
            <FaRetweet /> {t("post.retweeted_by")} @{retweetedBy}
          </div>
        )}

        <div className="post__content">
          <div className="post__avatar">
            <Link to={`/profile/${username}`}>
              <img src={avatar} alt={displayName} />
            </Link>
            {user?.verified && (
              <FaCheckCircle className="post__verification-badge" />
            )}
          </div>

          <div className="post__body">
            <div className="post__header">
              <div className="post__user-info">
                <h3 className="post__display-name">
                  <Link className="link" to={`/profile/${username}`}>
                    {displayName}
                  </Link>
                  {user?.verified && (
                    <FaCheckCircle className="post__verification-badge--inline" />
                  )}
                </h3>
                <span className="post__username">
                  <Link className="link" to={`/profile/${username}`}>
                    @{username}
                  </Link>
                </span>
                <span className="post__timestamp">
                  {isValidDate(createdAt)
                    ? `· ${formatDistanceToNow(new Date(createdAt))} ${t(
                        "post.ago"
                      )}`
                    : ""}
                </span>

                {firebaseUserId === loggedinuser?.firebaseUid && (
                  <>
                    <button
                      className="post__edit-button"
                      title="Edit tweet"
                      onClick={() => setShowModal(true)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="post__delete-button"
                      title="Delete tweet"
                      onClick={handleDelete}
                    >
                      <FaTrashAlt />
                    </button>
                  </>
                )}
              </div>

              <div className="post__text">
                <p>{text}</p>
              </div>
            </div>

            {image && (
              <div className="post__media">
                <img src={image} alt={t("post.media_alt")} />
              </div>
            )}

            <div className="post__engagement">
              <button
                className="post__engagement-button"
                data-action="comment"
                onClick={() => setShowComments(!showComments)}
              >
                <FaRegComment />
                <span>{comments.length || 0}</span>
              </button>

              <button
                className={`post__engagement-button ${liked ? "liked" : ""}`}
                data-action="like"
                onClick={handleLike}
              >
                {liked ? <FaHeart color="red" /> : <FaRegHeart />}
                <span>{likeCount}</span>
              </button>

              <button
                className="post__engagement-button"
                data-action="share"
                onClick={() => {
                  const shareData = {
                    title: `Check out this post by ${displayName}`,
                    text: text,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    navigator.share(shareData).catch((err) => {
                      console.error("Error sharing:", err);
                      alert("Sharing failed. Please try again.");
                    });
                  } else {
                    alert("Sharing is not supported on this browser.");
                  }
                }}
              >
                <FaShareSquare />
              </button>
            </div>

            {showComments && (
              <div className="post__comments">
                <CommentInput
                  postId={_id}
                  authToken={authToken}
                  onCommentAdded={() => {
                    setReplyCount((prev) => prev + 1);
                    setRefreshComments((prev) => !prev);
                  }}
                />
                <CommentList
                  postId={_id}
                  refreshTrigger={refreshComments}
                  currentUserId={loggedinuser?._id} // Pass MongoDB _id
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EditTweetModal
          tweet={data}
          authToken={authToken}
          onClose={() => setShowModal(false)}
          onSave={(updatedTweet) => {
            if (onEdit) onEdit(updatedTweet);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

export default Post;

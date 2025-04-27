import React, { useState } from "react";
import { Avatar, IconButton, CircularProgress, Button } from "@mui/material";
import { Image as ImageIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getAuth } from "firebase/auth";
import userLoggedinuser from "../../../hooks/userLoggedinuser";
import "./TweetBox.css";

function TweetBox() {
  const [tweetMessage, setTweetMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedinuser] = userLoggedinuser();
  const [error, setError] = useState("");

  const MAX_WORDS = 500; // Change from characters to words
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/tweets/addtweets`;

  const countWords = (text) => {
    return text.trim().split(/\s+/).length;
  };

  const handleTweetMessageChange = (e) => {
    const text = e.target.value;
    if (countWords(text) <= MAX_WORDS) {
      setTweetMessage(text);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tweets/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Image upload failed");
      const { imageUrl } = await response.json();
      return imageUrl;
    } catch (error) {
      console.error("❌ Image Upload Failed:", error);
      throw error;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!tweetMessage.trim()) return setError("Post cannot be empty.");
    if (countWords(tweetMessage) > MAX_WORDS)
      return setError(`Tweet exceeds ${MAX_WORDS} words.`);

    const user = getAuth().currentUser;
    if (!user) return setError("You must be logged in to post a tweet.");

    setIsLoading(true);
    try {
      const imageUrlToSend = selectedFile
        ? await handleImageUpload(selectedFile)
        : null;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.uid,
          text: tweetMessage.trim(),
          image: imageUrlToSend,
        }),
      });

      if (!response.ok) throw new Error("Failed to post tweet.");

      const newTweet = await response.json();

      setTweetMessage("");
      setSelectedFile(null);
      setImagePreview(null);

      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="tweetBox__input">
          <Avatar
            src={loggedinuser?.avatar || ""}
            className="user-avatar"
            sx={{ width: 42, height: 42, border: "2px solid #e0e0e0" }}
          />
          <textarea
            value={tweetMessage}
            onChange={handleTweetMessageChange}
            placeholder="What's happening?"
            rows="5"
            disabled={isLoading}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
              color: "#2d3436",
            }}
          />
          <div
            className={`tweetBox__charCounter ${
              countWords(tweetMessage) > MAX_WORDS - 20
                ? "tweetBox__charCounter--warning"
                : ""
            }`}
            style={{
              color:
                countWords(tweetMessage) > MAX_WORDS - 20
                  ? "#c92a2a"
                  : "#636e72",
            }}
          >
            {tweetMessage ? countWords(tweetMessage) : 0}/{MAX_WORDS}
          </div>
        </div>

        {imagePreview && (
          <div className="tweetBox__imagePreview">
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                borderRadius: "8px",
                objectFit: "cover",
                maxWidth: "100%",
              }}
            />
            <IconButton
              className="tweetBox__removeImage"
              onClick={removeImage}
              style={{ color: "#c92a2a" }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}

        <div className="tweetBox__footer">
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="tweetBox__fileInput"
            disabled={isLoading}
          />
          <IconButton
            component="label"
            htmlFor="file-upload"
            disabled={isLoading}
            style={{ color: "#2d3436" }}
          >
            <ImageIcon className="tweetBox__icon" />
          </IconButton>
          <Button
            type="submit"
            className="tweetBox__tweetButton"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <img
                src="/favicon.png"
                alt="Post"
                style={{ width: "24px", height: "24px" }}
              />
            )}
          </Button>
        </div>

        {error && (
          <div
            className="tweetBox__error"
            style={{
              color: "#c92a2a",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
              marginTop: "8px",
            }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default TweetBox;

import React, { useState } from "react";
import "./EditTweetModal.css";

function EditTweetModal({ tweet, onClose, onSave, authToken }) {
  const [text, setText] = useState(tweet.text);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      let imageUrl = tweet.image;

      // If image was updated, upload to Cloudinary first
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/tweets/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tweets/updatetweet/${
          tweet._id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text, image: imageUrl }),
        }
      );

      if (!res.ok) throw new Error("Failed to update tweet");
      const updatedTweet = await res.json();
      onSave(updatedTweet.tweet);
      window.location.reload(); // Reload the page to reflect changes
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error updating tweet");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Tweet</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {imageFile && (
          <div className="modal-image-preview">
            <img src={URL.createObjectURL(imageFile)} alt="Preview" />
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTweetModal;

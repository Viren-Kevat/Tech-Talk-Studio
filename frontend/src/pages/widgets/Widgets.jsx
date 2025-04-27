import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import "./Widgets.css";

function Widgets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/find`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: trimmedQuery }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setSearchResults(data ? [data] : []);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUserClick = (user) => {
    navigate(`/profile/${user.username}`);
  };

  return (
    <div className="widgets">
      <div className="widgets__search-container">
        <div className="widgets__search-input">
          <FaSearch className="widgets__search-icon" />
          <input
            type="text"
            placeholder="Search for username"
            className="widgets__search-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch} className="widgets__search-button">
            Search
          </button>
        </div>
      </div>

      <div className="widgets__content-container">
        {loading && <Loader loading={true} />}
        {error && <p className="widgets__error">USER NOT FOUND</p>}
        {searchResults.length > 0 && (
          <>
            <h2 className="widgets__heading">Search Results</h2>
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="sprofile-info"
                onClick={() => handleUserClick(user)}
              >
                <Avatar
                  src={user.avatar || ""}
                  className="profile-info__avatar"
                />
                <div className="sprofile-info__details">
                  <h4 className="sprofile-info__name">{user.displayName}</h4>
                  <h5 className="sprofile-info__username">@{user.username}</h5>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Widgets;

import React, { useState, useEffect } from "react";
import Post from "../../feed/post/Post";
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import Avatar from "@mui/material/Avatar";
import { useTranslation } from "react-i18next";

const Mainprofile = ({ user, uid }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSignOut = () => {
    // Assuming you have a signOut function in your auth context
    // Replace this with your actual sign-out logic
    localStorage.removeItem("userData");
    navigate("/login");
  };

  useEffect(() => {
    if (!uid) {
      console.warn(
        "User UID is not available in Mainprofile, skipping API call"
      );
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${uid}/tweets`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTweets(data);
        } else {
          setTweets([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching tweets in Mainprofile:", err);
        setTweets([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [uid]);

  if (!user)
    return <div className="profile-error">{t("profile.no_user_data")}</div>;

  return (
    <main className="main-profile-container">
      <header className="profile-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          <FaArrowLeft className="back-icon" aria-label={t("common.back")} />
        </button>
        <div className="header-info">
          <h1 className="profile-display-name">{user.displayName}</h1>
          <p className="tweet-count">
            {tweets.length} {t("profile.tweets")}
          </p>
        </div>
        <button className="sign-out-button" onClick={handleSignOut}>
          <FaSignOutAlt
            className="sign-out-icon"
            aria-label={t("common.sign_out")}
          />
        </button>
      </header>

      <section className="profile-cover-section">
        <div
          className="profile-cover-photo"
          style={{
            backgroundImage: `url(https://picsum.photos/600/400?random=${Math.random()})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="avatar-wrapper">
          <Avatar
            src={user.avatar || ""}
            sx={{
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            className="profile-avatar"
            alt={t("profile.user_avatar")}
          />
        </div>
      </section>

      <article className="profile-content">
        <section className="profile-info-section">
          <div className="profile-meta">
            <h2 className="profile-name">{user.displayName}</h2>
            <p className="profile-handle">@{user.username}</p>
          </div>

          <div className="profile-details">
            <p className="profile-bio">{user.bio || t("profile.no_bio")}</p>

            <div className="profile-meta-grid">
              {user.location && (
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  {user.location}
                </div>
              )}

              {user.website && (
                <div className="meta-item">
                  <span className="meta-icon">🌐</span>
                  <a
                    href={
                      user.website.startsWith("http")
                        ? user.website
                        : `https://${user.website}`
                    }
                    className="website-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {
                      new URL(
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      ).hostname
                    }
                  </a>
                </div>
              )}

              {user.dob && (
                <div className="meta-item">
                  <span className="meta-icon">🎂</span>
                  {new Date(user.dob).toLocaleDateString()}
                </div>
              )}

              {user.collegeName && (
                <div className="meta-item">
                  <span className="meta-icon">🎓</span>
                  {user.collegeName}
                </div>
              )}

              {user.course && (
                <div className="meta-item">
                  <span className="meta-icon">📘</span>
                  {user.course}
                </div>
              )}

              {user.graduationYear && (
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  {user.graduationYear}
                </div>
              )}

              {user.skills?.length > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">💼</span>
                  {user.skills.join(", ")}
                </div>
              )}

              {user.linkedinProfile && (
                <div className="meta-item">
                  <span className="meta-icon">🔗</span>
                  <a
                    href={user.linkedinProfile}
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </div>
              )}

              {user.githubProfile && (
                <div className="meta-item">
                  <span className="meta-icon">🐙</span>
                  <a
                    href={user.githubProfile}
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              )}

              {user.personalWebsite && (
                <div className="meta-item">
                  <span className="meta-icon">🌐</span>
                  <a
                    href={
                      user.personalWebsite.startsWith("http")
                        ? user.personalWebsite
                        : `https://${user.personalWebsite}`
                    }
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {
                      new URL(
                        user.personalWebsite.startsWith("http")
                          ? user.personalWebsite
                          : `https://${user.personalWebsite}`
                      ).hostname
                    }
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* No need for verification badge, followers, following since they are not in schema yet */}
        </section>

        <section className="tweets-section">
          {isLoading ? (
            [...Array(3)].map((_, i) => <TweetSkeleton key={i} />)
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            tweets.map((tweet, index) => (
              <Post key={tweet._id || `tweet-${index}`} data={tweet} />
            ))
          )}
        </section>
      </article>
    </main>
  );
};

const TweetSkeleton = () => (
  <div className="tweet-skeleton">
    <div className="skeleton-avatar" />
    <div className="skeleton-content">
      <div className="skeleton-line medium" />
      <div className="skeleton-line long" />
      <div className="skeleton-line short" />
    </div>
  </div>
);

export default Mainprofile;

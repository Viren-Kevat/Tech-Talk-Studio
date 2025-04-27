import React, { useState, useEffect, Suspense, lazy } from "react";
import TweetBox from "./tweetbox/TweetBox";
import Post from "./post/Post";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loader";
import "./Feed.css";

const Sidebar = lazy(() => import("../sidebar/Sidebar"));
const Widgets = lazy(() => import("../widgets/Widgets"));

function Feed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetching tweets when the component is mounted
  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/tweets/tweets`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tweets");
        }

        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  // Handles removing deleted tweet from UI
  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((tweet) => tweet._id !== deletedId));
  };

  // Handles adding new tweet to the UI after posting

  if (loading) return <Loader loading={true} />;

  if (error)
    return (
      <div>
        {t("errors.something_went_wrong")}: {error}
      </div>
    );

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>{t("navbar.home")}</h2>
      </div>
      {/* Pass the handleNewTweet function to TweetBox to update the feed after a tweet is posted */}
      <TweetBox />
      {posts.map((post) => (
        <Post key={post._id} data={post} onDelete={handleDelete} />
      ))}
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar />
      </Suspense>
    </div>
  );
}

export default Feed;

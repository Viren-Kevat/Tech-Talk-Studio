import React, { useState, useEffect, Suspense, lazy } from "react";
import Sidebar from "../sidebar/Sidebar";
import Widgets from "../widgets/Widgets";
import Post from "../feed/post/Post"; // ✅ Make sure this path is correct
import { useUserAuth } from "../../context/Userauthcontext";
import "./Profile.css";
import { Margin } from "@mui/icons-material";
import Loader from "../../components/Loader";

const Editprofile = lazy(() => import("./Editprofile/Editprofile"));
const Mainprofile = lazy(() => import("./Mainprofile/Mainprofile"));

const Profile = () => {
  const { user } = useUserAuth(); // Get logged-in user
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        console.error("User UID is not available");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid) {
      console.error("User UID is not available");
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}/tweets`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTweets(data);
        } else {
          setTweets([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching tweets:", err);
        setTweets([]);
      });
  }, [user]);

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((tweet) => tweet._id !== deletedId));
  };

  // Loading State
  if (isLoading) return <Loader loading={true} />;

  // Error State with Retry Button
  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // No User Data Found
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="profilePage">
      <Sidebar user={user} />
      <main className="profile-main-content">
        <Suspense fallback={<div>Loading Edit Profile...</div>}>
          <Editprofile user={userData} />
        </Suspense>
        <Suspense fallback={<div>Loading Main Profile...</div>}>
          <Mainprofile user={userData} uid={user.uid} pic={user.photoURL} />
        </Suspense>
      </main>
    </div>
  );
};

export default Profile;

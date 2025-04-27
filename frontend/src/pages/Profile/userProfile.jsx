// src/pages/UserProfile.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Mainprofile from "./Mainprofile/Mainprofile";
import Sidebar from "../sidebar/Sidebar";
import Loader from "../../components/Loader";
import "./userProfile.css"; // We'll also upgrade this CSS below

function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/students/${username}`
        );
        console.log("Response:", res);

        if (!res.ok) {
          const errMsg = await res
            .json()
            .then((data) => data.message)
            .catch(() => res.statusText);
          throw new Error(errMsg);
        }
        const data = await res.json();
        console.log("User Data:", data);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="profile-loader">
        <Loader loading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="userprofilePage">
      <Sidebar />
      <main className="profile-main-content">
        <Mainprofile
          user={user}
          uid={user?.uid || user?.firebaseUid}
          pic={user?.avatar || user?.photoURL}
        />
      </main>
    </div>
  );
}

export default UserProfile;

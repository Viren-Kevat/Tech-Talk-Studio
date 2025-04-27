import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import Widgets from "./widgets/Widgets";
import Feed from "./feed/Feed";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/Userauthcontext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./Language/LanguageSwitcher";
import Loader from "../components/Loader";
import "./Home.css";

function Home() {
  const { t } = useTranslation();
  const { logout, user } = useUserAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlelogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <>
      {/* <LanguageSwitcher /> */}
      <div className="home">
        <Sidebar handlelogout={handlelogout} user={user} />

        <div className="home__feed">
          <Feed />
        </div>

        <div className="home__widgets">
          <Widgets />
        </div>
      </div>
    </>
  );
}

export default Home;

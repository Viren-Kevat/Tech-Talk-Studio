import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import {
  FaHome,
  FaCompass,
  FaPenAlt,
  FaBookmark,
  FaUser,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { Avatar, IconButton, Menu, MenuItem, Modal } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/Userauthcontext";
import SidebarOperation from "./SidebarOperation";
import { useTranslation } from "react-i18next";
import userLoggedinuser from "../../hooks/userLoggedinuser";
import Widgets from "../widgets/Widgets";
import "./Sidebar.css";

const Sidebar = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { logout, user } = useUserAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggedinuser] = userLoggedinuser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openmenu = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const result = user?.email ? user.email.split("@") : ["", ""];

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="sidebar">
          <div className="sidebar__logo">
            <img
              src="/symbol.png"
              alt="Logo"
              className="logo-image"
              style={{
                width: "10rem",
                height: "10rem",
                borderRadius: "10%",
                margin: "0 auto",
              }}
            />
            <span className="logo-text"></span>
          </div>

          <NavLink to="/home" className="nav-link">
            <SidebarOperation icon={FaHome} text={t("navbar.home")} />
          </NavLink>

          <NavLink to="/profile" className="nav-link">
            <SidebarOperation icon={FaUser} text={t("navbar.profile")} />
          </NavLink>

          <div className="user-panel">
            <Avatar
              src={loggedinuser?.avatar || ""}
              className="user-avatar"
              sx={{ width: 42, height: 42 }}
            />
            <div className="user-info">
              <h4 className="user-name">{loggedinuser?.displayName}</h4>
              <p className="user-role">Student</p>
            </div>
            <IconButton onClick={handleClick} className="more-btn">
              <MoreHorizIcon />
            </IconButton>
          </div>

          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={openmenu}
            onClose={handleClose}
          >
            <MenuItem
              className="profile-info"
              onClick={() => {
                navigate("/profile");
                handleClose();
              }}
            >
              <Avatar src={loggedinuser?.avatar || ""} />
              <div className="user-info sub-user-info">
                <h4>{loggedinuser?.displayName}</h4>
                <h5>{result[0]}</h5>
              </div>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleLogout();
                handleClose();
              }}
            >
              {t("logout")} @{result[0]}
            </MenuItem>
          </Menu>
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="mobile-nav">
          <NavLink to="/home" className="nav-link">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/profile" className="nav-link">
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </NavLink>

          <NavLink className="nav-link" onClick={() => setIsSearchOpen(true)}>
            <FaSearch className="nav-icon" />
            <span>Search</span>
          </NavLink>
        </div>
      )}

      {/* Search Modal */}
      <Modal open={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
        <div className="search-modal">
          <Widgets />
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;

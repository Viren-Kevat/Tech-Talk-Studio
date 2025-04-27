import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { FaTwitter } from "react-icons/fa";
import { useUserAuth } from "../context/Userauthcontext";
import { useTranslation } from "react-i18next";
import { Google } from "@mui/icons-material";
import { Button } from "@mui/material";
import Loader from "../components/Loader";
import "./Signup.css";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [Contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [dob, setDob] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(null);
  const [graduationYear, setGraduationYear] = useState(null);
  const [skills, setSkills] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [personalWebsite, setPersonalWebsite] = useState("");
  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [signupMethod, setSignupMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, user } = useUserAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && signupMethod === "google") {
      setEmail(user.email || "");
      setDisplayName(user.displayName || "");
    }
  }, [user, signupMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (signupMethod === "email" && !password) {
        throw new Error(t("errors.password_required"));
      }

      let firebaseUser;

      if (signupMethod === "email") {
        firebaseUser = await signup(email, password);
      } else {
        // For Google signup, ensure user is authenticated
        if (!user) {
          throw new Error(t("errors.google_signup_failed"));
        }
        firebaseUser = { user };
      }

      console.log("Firebase user:", firebaseUser); // Log the firebaseUser object

      const userData = {
        uid: firebaseUser.user.uid,
        displayName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        mobileNumber: Contact, // Update field name to match schema
        ...(signupMethod === "email" && { password }),
        bio,
        location,
        website,
        dob,
        avatar: "https://example.com/default-avatar.jpg",
        collegeName,
        course,
        yearOfStudy,
        graduationYear,
        skills: skills.split(",").map((skill) => skill.trim()), // Convert comma-separated string to array
        linkedinProfile,
        githubProfile,
        personalWebsite,
      };

      console.log("User data to be sent to backend:", userData); // Log the userData object

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.registration_failed"));
      }

      setRedirect(true);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || t("errors.registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setLoading(true);
      const firebaseUser = await loginWithGoogle();
      setSignupMethod("google");

      console.log("Firebase user:", firebaseUser); // Log the firebaseUser object

      const userData = {
        uid: firebaseUser.user.uid,
        displayName: firebaseUser.user.displayName,
        username: firebaseUser.user.displayName
          .toLowerCase()
          .replace(/[^a-zA-Z0-9_]/g, ""),
        email: firebaseUser.user.email.toLowerCase(),
        mobileNumber: "",
        bio: "",
        location: "",
        website: "",
        dob: "",
        avatar:
          firebaseUser.user.photoURL ||
          "https://example.com/default-avatar.jpg",
        collegeName: "",
        course: "",
        yearOfStudy: null,
        graduationYear: null,
        skills: [],
        linkedinProfile: "",
        githubProfile: "",
        personalWebsite: "",
      };

      console.log("User data to be sent to backend:", userData); // Log the userData object

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      setRedirect(true);

      if (!response.ok) {
        throw new Error(data.error || t("errors.registration_failed"));
      }

      setRedirect(true);
    } catch (error) {
      console.error("Google Sign-Up error:", error);
      setError(error.message || t("errors.registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  if (redirect) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="signup-container">
      <div className="auth-branding">
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
      </div>

      <div className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">{t("signup.create_account")}</h1>
          <p className="auth-subtitle">{t("Join Community")}</p>
        </header>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="displayName">{t("signup.display_name")}</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">{t("signup.username")}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t("signup.email")}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {signupMethod === "email" && (
              <div className="form-group">
                <label htmlFor="password">{t("password")}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="bio">
                {t("signup.bio")} ({t("optional")})
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">
                {t("signup.location")} ({t("optional")})
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">{t("dob")}</label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="collegeName">
                {t("signup.college_name")} ({t("optional")})
              </label>
              <input
                id="collegeName"
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">
                {t("signup.course")} ({t("optional")})
              </label>
              <input
                id="course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearOfStudy">
                {t("signup.year_of_study")} ({t("optional")})
              </label>
              <input
                id="yearOfStudy"
                type="number"
                value={yearOfStudy || ""}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="graduationYear">
                {t("signup.graduation_year")} ({t("optional")})
              </label>
              <input
                id="graduationYear"
                type="number"
                value={graduationYear || ""}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">
                {t("signup.skills")} ({t("optional")})
              </label>
              <input
                id="skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder={t("signup.skills_placeholder")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedinProfile">
                {t("signup.linkedin_profile")} ({t("optional")})
              </label>
              <input
                id="linkedinProfile"
                type="url"
                value={linkedinProfile}
                onChange={(e) => setLinkedinProfile(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="githubProfile">
                {t("signup.github_profile")} ({t("optional")})
              </label>
              <input
                id="githubProfile"
                type="url"
                value={githubProfile}
                onChange={(e) => setGithubProfile(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="personalWebsite">
                {t("signup.personal_website")} ({t("optional")})
              </label>
              <input
                id="personalWebsite"
                type="url"
                value={personalWebsite}
                onChange={(e) => setPersonalWebsite(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-primary-btn">
            {t("signup.sign_up")}
          </button>

          <div className="auth-divider">{t("or")}</div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            className="auth-google-btn"
            startIcon={<Google style={{ color: "red" }} />}
            style={{
              borderRadius: "24px",
              fontWeight: "500",
              fontSize: "1rem",
            }}
          >
            {t("Sign Up With Google")}
          </Button>
        </form>

        <div className="auth-footer">
          {t("signup.already_have_account")}{" "}
          <Link to="/" className="auth-link">
            {t("signup.log_in")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

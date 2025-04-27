import React, { useState } from "react";
import "./Editprofile.css";
import {
  Box,
  IconButton,
  Modal,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FaChevronRight } from "react-icons/fa";

const InputField = ({ label, value, onChange, ...props }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />
);

const EditProfile = ({ user }) => {
  const [name, setName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [website, setWebsite] = useState(user.website || "");
  const [dob, setDob] = useState(
    user.dob ? new Date(user.dob).toISOString().split("T")[0] : ""
  );
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [open, setOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(user.mobileNumber || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [collegeName, setCollegeName] = useState(user.collegeName || "");
  const [course, setCourse] = useState(user.course || "");
  const [yearOfStudy, setYearOfStudy] = useState(user.yearOfStudy || null);
  const [graduationYear, setGraduationYear] = useState(
    user.graduationYear || null
  );
  const [skills, setSkills] = useState(
    user.skills ? user.skills.join(", ") : ""
  );
  const [linkedinProfile, setLinkedinProfile] = useState(
    user.linkedinProfile || ""
  );
  const [githubProfile, setGithubProfile] = useState(user.githubProfile || "");
  const [personalWebsite, setPersonalWebsite] = useState(
    user.personalWebsite || ""
  );

  const validateMobile = (mobile) => /^\+?[1-9]\d{1,14}$/.test(mobile);
  const validateWebsite = (website) => {
    try {
      new URL(website);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);

    if (mobileNumber && !validateMobile(mobileNumber)) {
      setError("Invalid mobile number format!");
      setLoading(false);
      return;
    }

    if (website && !validateWebsite(website)) {
      setError("Invalid website URL format!");
      setLoading(false);
      return;
    }

    let avatarUrl = avatar;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

      try {
        const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.secure_url) avatarUrl = data.secure_url;
        else throw new Error(data.error?.message || "Image upload failed");
      } catch (err) {
        setError("Image Upload Error: " + err.message);
        setLoading(false);
        return;
      }
    }

    const updatedProfile = {
      displayName: name,
      bio,
      location,
      website,
      dob,
      avatar: avatarUrl,
      mobileNumber,
      collegeName,
      course,
      yearOfStudy,
      graduationYear,
      skills: skills.split(",").map((skill) => skill.trim()),
      linkedinProfile,
      githubProfile,
      personalWebsite,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.firebaseUid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Profile update failed");
      }

      alert("Profile updated successfully");
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        className="edit-btn"
      >
        Edit Profile
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="edit-profile__modal">
          <div className="edit-profile__header">
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">Edit Profile</Typography>
          </div>

          {error && <p className="error-message">{error}</p>}

          <form className="edit-profile__form">
            <InputField label="Name" value={name} onChange={setName} />
            <InputField
              label="Bio"
              value={bio}
              onChange={setBio}
              multiline
              rows={3}
            />
            <InputField
              label="Mobile Number"
              value={mobileNumber}
              onChange={setMobileNumber}
            />
            <InputField
              label="Location"
              value={location}
              onChange={setLocation}
            />
            <InputField label="Website" value={website} onChange={setWebsite} />
            <InputField
              label="College Name"
              value={collegeName}
              onChange={setCollegeName}
            />
            <InputField label="Course" value={course} onChange={setCourse} />
            <InputField
              label="Year of Study"
              value={yearOfStudy || ""}
              onChange={(value) => setYearOfStudy(Number(value))}
              type="number"
            />
            <InputField
              label="Graduation Year"
              value={graduationYear || ""}
              onChange={(value) => setGraduationYear(Number(value))}
              type="number"
            />
            <InputField
              label="Skills"
              value={skills}
              onChange={setSkills}
              placeholder="Comma-separated skills"
            />
            <InputField
              label="LinkedIn Profile"
              value={linkedinProfile}
              onChange={setLinkedinProfile}
            />
            <InputField
              label="GitHub Profile"
              value={githubProfile}
              onChange={setGithubProfile}
            />
            <InputField
              label="Personal Website"
              value={personalWebsite}
              onChange={setPersonalWebsite}
            />

            <div className="image-upload-container">
              <label htmlFor="image-upload" className="upload-label">
                Click here to upload an image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden-input"
              />
            </div>

            <BirthdaySection dob={dob} setDob={setDob} />
          </form>

          <div className="edit-profile__footer">
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              fullWidth
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

const BirthdaySection = ({ dob, setDob }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="birthday-section">
      <div className="birthday-trigger" onClick={() => setOpen(true)}>
        <span>Birth Date</span>
        <span>{dob || "Add your date of birth"}</span>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="birthday-modal">
          <h3>Edit Date of Birth</h3>
          <p>
            This can only be changed a few times. Make sure you enter the age of
            the person who will be using this account.
          </p>

          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="birthday-modal__date-input"
          />

          <div className="birthday-modal__actions">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditProfile;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../context/firebase";
import {
  Alert,
  Button,
  TextField,
  Snackbar,
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lastRequest = localStorage.getItem("lastPasswordResetRequest");
    setLastRequestTime(lastRequest ? parseInt(lastRequest) : null);
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setSuccess(t("forgot_password.password_copied"));
  };

  const updatePasswordInBackend = async (email, newPassword) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update password in backend");
      }

      setSuccess(t("forgot_password.password_updated"));
    } catch (error) {
      setError(t("forgot_password.update_failed"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!emailOrPhone) {
      setError(t("forgot_password.enter_email_or_phone"));
      return;
    }

    try {
      const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
      const isPhone = /^\d{10}$/.test(emailOrPhone);

      if (!isEmail && !isPhone) {
        setError(t("forgot_password.invalid_format"));
        return;
      }

      if (isEmail) {
        await sendPasswordResetEmail(auth, emailOrPhone);
        setSuccess(t("forgot_password.reset_link_sent", { emailOrPhone }));
      } else {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
          },
          auth
        );
        await signInWithPhoneNumber(
          auth,
          `+1${emailOrPhone}`,
          window.recaptchaVerifier
        );
        setSuccess(t("forgot_password.verification_code_sent"));
      }

      if (generatedPassword) {
        await updatePasswordInBackend(emailOrPhone, generatedPassword);
      }

      localStorage.setItem("lastPasswordResetRequest", Date.now());
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          border: "1px solid #cccccc",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "#000000",
            mb: 4,
            fontFamily: "'Segoe UI', system-ui",
          }}
        >
          {t("forgot_password.title")}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t("forgot_password.email_or_phone")}
            variant="outlined"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            sx={{
              mb: 3,
              input: { color: "#000000" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
                "& fieldset": {
                  borderColor: "#cccccc",
                },
                "&:hover fieldset": {
                  borderColor: "#000000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#000000",
                },
              },
              "& label": {
                color: "#555555",
              },
              "& label.Mui-focused": {
                color: "#000000",
              },
            }}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#000000",
                color: "#ffffff",
                borderRadius: "30px",
                height: "45px",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#333333",
                },
              }}
            >
              {t("forgot_password.send_reset_link")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{
                borderColor: "#000000",
                color: "#000000",
                borderRadius: "30px",
                height: "45px",
                fontWeight: "bold",
                "&:hover": {
                  borderColor: "#333333",
                  color: "#333333",
                },
              }}
            >
              {t("forgot_password.back_to_login")}
            </Button>
          </Box>
        </form>

        <div id="recaptcha-container"></div>

        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #cccccc" }}>
          <Typography
            variant="h6"
            sx={{ color: "#000000", fontWeight: "bold", mb: 2 }}
          >
            {t("forgot_password.generate_secure_password")}
          </Typography>

          <Button
            variant="contained"
            onClick={generatePassword}
            sx={{
              backgroundColor: "#000000",
              color: "#ffffff",
              borderRadius: "30px",
              height: "45px",
              fontWeight: "bold",
              mb: 2,
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
          >
            {t("forgot_password.generate_secure_password")}
          </Button>

          {generatedPassword && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f5f5f5",
                border: "1px solid #cccccc",
                borderRadius: "12px",
                p: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#000000",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {generatedPassword}
              </Typography>
              <IconButton onClick={copyToClipboard} sx={{ color: "#000000" }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Snackbar
          open={!!error || !!success}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={error ? "error" : "success"}
            sx={{
              backgroundColor: error ? "#f8d7da" : "#e0e0e0",
              color: "#000000",
              border: error ? "1px solid #f5c6cb" : "1px solid #cccccc",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;

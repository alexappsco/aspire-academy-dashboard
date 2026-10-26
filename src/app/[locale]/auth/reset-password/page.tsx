"use client";

import { useEffect, useState } from "react";
import { useRouter } from "src/i18n/routing";
import { useTranslations } from "next-intl";
import { resetPasswordAction } from "src/actions/auth";
import {
  clearPasswordResetSession,
  readForgotPasswordEmail,
  readResetPasswordToken,
} from "src/utils/password-reset-session";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ResetPasswordPage() {
  const router = useRouter();
  const t = useTranslations("ResetPassword");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = readForgotPasswordEmail();
    const storedToken = readResetPasswordToken();
    if (!storedEmail || !storedToken) {
      router.replace("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
    setToken(storedToken);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => {
      router.push("/auth/login");
    }, 2500);
    return () => window.clearTimeout(id);
  }, [success, router]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError(t("required"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }
    if (!email || !token) {
      setError(t("invalid_session"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await resetPasswordAction({
        token,
        email,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      if (!result.success) {
        setError(result.error || t("generic_error"));
        return;
      }

      clearPasswordResetSession();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!ready && !success) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        alignItems: "center",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          minHeight: { md: "100vh" },
          bgcolor: "#1B2942",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          order: { xs: 2, md: 1 },
          borderRadius: {
            xs: "0 0 50px 50px",
            md: "45% 0 0 45%",
          },
          py: { xs: 8, md: 0 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, px: 4, color: "#fff" }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
          >
            {t("title")}
          </Typography>

          {success ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t("success_title")}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem" }}>
                {t("success_hint")}
              </Typography>
              <Button
                onClick={() => router.push("/auth/login")}
                sx={{
                  bgcolor: "#ebedef",
                  color: "#374151",
                  fontWeight: 500,
                  py: 1.5,
                  px: 4,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "#d1d5db" },
                  mt: 2,
                }}
              >
                {t("login_now")}
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                type={showPassword ? "text" : "password"}
                placeholder={t("new_password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: "#fff",
                      borderRadius: "12px",
                      "& fieldset": { border: "none" },
                    },
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    py: 2,
                    px: 2,
                  },
                }}
              />

              <TextField
                type={showConfirm ? "text" : "password"}
                placeholder={t("confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowConfirm((prev) => !prev)}
                          edge="end"
                          sx={{ color: "text.secondary" }}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: "#fff",
                      borderRadius: "12px",
                      "& fieldset": { border: "none" },
                    },
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    py: 2,
                    px: 2,
                  },
                }}
              />

              {error && (
                <Typography sx={{ color: "#ff8a8a", fontSize: "0.85rem", textAlign: "right", fontWeight: 600 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                disabled={loading}
                sx={{
                  bgcolor: "#ebedef",
                  color: "#374151",
                  fontWeight: 500,
                  py: 2,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "#d1d5db" },
                  "&.Mui-disabled": { bgcolor: "#b0b4ba", color: "#6b7280" },
                  mt: 4,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t("submit")}
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/auth/login")}
                sx={{ color: "#fff", textDecoration: "underline", fontSize: "0.9rem" }}
              >
                {t("back_to_login")}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          order: { xs: 1, md: 2 },
        }}
      >
        <Box
          component="img"
          src="/logo.svg"
          alt="aspire academy"
          sx={{ width: { xs: 200, md: 350 }, objectFit: "contain" }}
        />
      </Box>
    </Box>
  );
}

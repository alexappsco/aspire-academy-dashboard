"use client";

import { useState } from "react";
import { useRouter } from "src/i18n/routing";
import { useTranslations } from "next-intl";
import { forgetPasswordAction } from "src/actions/auth";
import { saveForgotPasswordEmail } from "src/utils/password-reset-session";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("email_required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("invalid_email"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await forgetPasswordAction({ email: trimmed });
      if (!result.success) {
        setError(result.error || t("generic_error"));
        return;
      }

      saveForgotPasswordEmail(trimmed);
      router.push("/auth/otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic_error"));
    } finally {
      setLoading(false);
    }
  };

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
              type="email"
              placeholder="example@gmail.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              slotProps={{
                input: {
                  sx: {
                    bgcolor: "#fff",
                    borderRadius: "12px",
                    "& fieldset": { border: "none" },
                  },
                },
              }}
              sx={{
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

            <Typography
              sx={{ color: "#fff", fontSize: "0.75rem", textAlign: "right" }}
            >
              {t("hint")}
            </Typography>

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
                mt: 2,
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

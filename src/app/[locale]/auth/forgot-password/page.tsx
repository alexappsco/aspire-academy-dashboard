"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";


export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    setError("");
    setLoading(true);
    setSuccess(true);
    setLoading(false);
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
            نسيت كلمة المرور
          </Typography>

          {success ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                تم إرسال رابط استعادة كلمة المرور!
              </Typography>
              <Typography sx={{ fontSize: "0.9rem" }}>
                يرجى التحقق من بريدك الإلكتروني ({email}) للوصول إلى رابط إعادة التعيين.
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
                العودة لتسجيل الدخول
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                type="email"
                placeholder="example@gmail.com"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                سيتم إرسال رابط إلى عنوان البريد لإعادة تعيين كلمة المرور
              </Typography>

              <Button
                onClick={handleSubmit}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : "إرسال الرابط"}
              </Button>

              <Button
                onClick={() => router.push("/auth/login")}
                sx={{ color: "#fff", textDecoration: "underline", fontSize: "0.9rem" }}
              >
                العودة لتسجيل الدخول
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

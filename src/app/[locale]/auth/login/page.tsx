"use client";

import { useState } from "react";
import { useRouter } from "src/i18n/routing";
import { useTranslations } from "next-intl";
import { useToast } from "src/components/toast";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("store@user.com");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@gmail.com"
              dir="ltr"
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

            <Box>
              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder={t("password_placeholder")}
                
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
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

              <Typography
                onClick={() => router.push("/auth/forgot-password")}
                sx={{
                  color: "#fff",
                  fontSize: "0.75rem",
                  textDecoration: "underline",
                  cursor: "pointer",
                  mt: 1,
                  textAlign: "right",
                }}
              >
                {t("forgot_password")}
              </Typography>
            </Box>

            <Button
              onClick={() => {
                setLoading(true);
                success(t("login_success"));
                setTimeout(() => {
                  router.push("/");
                }, 1000);
              }}
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
                mt: 4,
              }}
            >
              {loading ? t("processing") : t("login")}
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 2.5,
              }}
            >
              <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(255,255,255,0.25)" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>
                {t("or")}
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(255,255,255,0.25)" }} />
            </Box>

            <Button
              onClick={() => router.push("/auth/register")}
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.45)",
                fontWeight: 600,
                py: 1.75,
                borderRadius: "999px",
                fontSize: "1rem",
                textTransform: "none",
                backdropFilter: "blur(6px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.26)" },
              }}
            >
              {t("create_account")}
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

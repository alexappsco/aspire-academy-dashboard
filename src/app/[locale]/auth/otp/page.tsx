"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "src/i18n/routing";
import { useTranslations } from "next-intl";
import { forgetPasswordAction, verifyForgetPasswordOtpAction } from "src/actions/auth";
import {
  readForgotPasswordEmail,
  saveResetPasswordToken,
} from "src/utils/password-reset-session";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

function formatCountdown(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function OtpPage() {
  const router = useRouter();
  const t = useTranslations("Otp");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = readForgotPasswordEmail();
    if (!stored) {
      router.replace("/auth/forgot-password");
      return;
    }
    setEmail(stored);
    setReady(true);
  }, [router]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const focusIndex = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (text: string) => {
    const pasted = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError(t("incomplete"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await verifyForgetPasswordOtpAction({ email, otp });
      if (!result.success || !result.data?.token) {
        setError(result.error || t("generic_error"));
        return;
      }

      saveResetPasswordToken(result.data.token);
      router.push("/auth/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending || !email) return;

    setError("");
    setResending(true);
    try {
      const result = await forgetPasswordAction({ email });
      if (!result.success) {
        setError(result.error || t("generic_error"));
        return;
      }
      setDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(RESEND_SECONDS);
      focusIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic_error"));
    } finally {
      setResending(false);
    }
  };

  if (!ready) return null;

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
            sx={{ fontWeight: 700, textAlign: "center", mb: 4 }}
          >
            {t("title")}
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerify();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "0.875rem",
                lineHeight: 1.8,
              }}
            >
              {t("instruction", { email })}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 2, md: 3 },
              }}
            >
              {digits.map((digit, index) => (
                <Box
                  key={index}
                  component="input"
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="-"
                  value={digit}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  ref={(el: HTMLInputElement | null) => {
                    inputsRef.current[index] = el;
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(index, e)
                  }
                  onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                    e.preventDefault();
                    handlePaste(e.clipboardData.getData("text"));
                  }}
                  sx={{
                    width: { xs: 72, md: 96 },
                    height: { xs: 88, md: 112 },
                    borderRadius: "28px",
                    bgcolor: "#EBEDEF",
                    color: "#2B2B2B",
                    fontSize: "2.5rem",
                    textAlign: "center",
                    border: "none",
                    outline: "none",
                    "&:focus": {
                      boxShadow: "0 0 0 2px #c4b5fd",
                    },
                    "&::placeholder": { color: "#9ca3af", fontSize: "2rem" },
                  }}
                />
              ))}
            </Box>

            {error && (
              <Typography sx={{ color: "#ff8a8a", fontSize: "0.85rem", textAlign: "center", fontWeight: 600 }}>
                {error}
              </Typography>
            )}

            <Typography
              onClick={() => {
                void handleResend();
              }}
              sx={{
                textAlign: "center",
                fontSize: "0.75rem",
                textDecoration: "underline",
                fontWeight: 700,
                cursor: secondsLeft > 0 || resending ? "default" : "pointer",
                opacity: secondsLeft > 0 || resending ? 0.7 : 1,
              }}
            >
              {secondsLeft > 0
                ? t("resend_in", { time: formatCountdown(secondsLeft) })
                : t("resend")}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : t("next")}
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

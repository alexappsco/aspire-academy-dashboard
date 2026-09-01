"use client";

import { useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";


export default function OtpPage() {
  const router = useRouter();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
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
            sx={{ fontWeight: 700, textAlign: "center", mb: 4 }}
          >
            الرمز التأكيدي
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "0.875rem",
                lineHeight: 1.8,
              }}
            >
              ادخل الرمز التأكيدي الذي تم إرساله إلى الرقم
              <Typography
                component="span"
                sx={{ fontWeight: 500, display: "inline" }}
              >
                {" "}
                +966396******
              </Typography>
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 2, md: 3 },
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  component="input"
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="-"
                  ref={(el: HTMLInputElement | null) => {
                    inputsRef.current[i] = el;
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInput(i, e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(i, e)
                  }
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

            <Typography
              sx={{
                textAlign: "center",
                fontSize: "0.75rem",
                textDecoration: "underline",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              إعادة الارسال 00:59
            </Typography>

            <Button
              onClick={() => router.push("/auth/reset-password")}
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
                mt: 2,
              }}
            >
              التالي
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

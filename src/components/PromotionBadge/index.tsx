"use client";

import { Box, Typography } from "@mui/material";
import Iconify from "src/components/iconify";
import { StorePromotion } from "src/types/store";

interface PromotionBadgeProps {
  promotion?: StorePromotion | null;
  locale: string;
  labels: {
    none: string;
  };
}

export default function PromotionBadge({
  promotion,
  locale,
  labels,
}: PromotionBadgeProps) {
  if (!promotion) {
    return (
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "#9ca3af" }}
      >
        {labels.none}
      </Typography>
    );
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" },
    );

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0.375,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Iconify
          icon="solar:calendar-bold"
          sx={{ fontSize: 12, color: "#9ca3af" }}
        />
        <Typography
          component="span"
          sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#4b5563" }}
        >
          {formatDate(promotion.start_date)}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Iconify
          icon="solar:calendar-mark-bold-duotone"
          sx={{ fontSize: 12, color: "#9ca3af" }}
        />
        <Typography
          component="span"
          sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#4b5563" }}
        >
          {formatDate(promotion.end_date)}
        </Typography>
      </Box>
    </Box>
  );
}

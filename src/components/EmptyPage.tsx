"use client";

import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

interface EmptyPageProps {
  tKey: string;
}

export default function EmptyPage({ tKey }: EmptyPageProps) {
  const t = useTranslations("Sidebar");

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#171717" }}>
        {t(tKey)}
      </Typography>
    </Box>
  );
}

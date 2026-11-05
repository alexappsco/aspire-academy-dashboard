"use client";

import { useState } from "react";
import { Box, useTheme } from "@mui/material";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          "@media print": {
            mt: 0,
            minHeight: "auto",
            display: "block",
          },
        }}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 4,
            bgcolor: "#f9fafb",
            color: "#171717",
            minWidth: 0,
            maxWidth: "100%",
            borderTop: "1px solid #1B83541A",
            [theme.breakpoints.up("md")]: {
              borderInlineStart: "1px solid #1B83541A",
              // borderStartStartRadius: 12,
            },
            "@media print": {
              p: 0,
              bgcolor: "transparent",
              border: "none !important",
              borderTop: "none !important",
              borderInlineStart: "none !important",
            },
          }}
        >
          <Box
            sx={{
              maxWidth: "1536px",
              mx: "auto",
              width: "100%",
              "@media print": {
                maxWidth: "100%",
                m: 0,
                p: 0,
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "src/i18n/routing";
import { useLocale } from "next-intl";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PersonIcon from "@mui/icons-material/Person";
import Iconify from "src/components/iconify";
import { localesSettings, LocaleType, allLocales } from "src/i18n/config-locale";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const currentLocaleSetting = localesSettings[locale as LocaleType];

  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(null);

  const handleLangOpen = (e: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(e.currentTarget);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  const handleAvatarOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(e.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogin = () => {
    handleAvatarClose();
    router.push("/auth/login");
  };

  const changeLanguage = (newLocale: string) => {
    handleLangClose();
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: "none" }, color: "#171717" }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src="/logo.svg"
            alt="Trade Global"
            sx={{ height: 54, marginInlineStart: { xs: 0, md: "60px" } }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, marginInlineEnd: { xs: 1, md: 2 } }}>
          <Box
            onClick={handleLangOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: "999px",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.06)",
              },
            }}
          >
            <Iconify
              icon={currentLocaleSetting?.icon || "emojione:flag-for-saudi-arabia"}
              width={20}
            />
            <Typography
              sx={{
                color: "#171717",
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {currentLocaleSetting?.label}
            </Typography>
            <ExpandMoreRoundedIcon sx={{ fontSize: 15, color: "#9DA4AE" }} />
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: "rgba(0,0,0,0.12)", my: 0.75 }}
          />

          <Avatar
            sx={{ width: 36, height: 36, bgcolor: "#1B8354", cursor: "pointer" }}
            onClick={handleAvatarOpen}
          >
            <PersonIcon />
          </Avatar>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={langAnchorEl}
        open={Boolean(langAnchorEl)}
        onClose={handleLangClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 140,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        {allLocales.map((loc) => (
          <MenuItem
            key={loc.value}
            selected={loc.value === locale}
            onClick={() => changeLanguage(loc.value)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Iconify icon={loc.icon} width={24} />
            </ListItemIcon>
            <ListItemText>{loc.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={avatarAnchorEl}
        open={Boolean(avatarAnchorEl)}
        onClose={handleAvatarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 160,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        <MenuItem onClick={handleLogin}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Iconify icon="solar:login-2-outline" width={20} />
          </ListItemIcon>
          <ListItemText>تسجيل الدخول</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

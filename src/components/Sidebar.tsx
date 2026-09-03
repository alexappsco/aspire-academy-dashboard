"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "src/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { scrollbar } from "src/theme/css";
import SvgColor from "src/components/svg-color";
import { useAuth } from "src/contexts/AuthContext";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

interface SidebarItem {
  key: string;
  icon?: string;
  path?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  // 1. الرئيسية
  {
    key: "home",
    icon: "/icons/main.svg",
    path: "/",
  },
  // 2. إدارة الدورات التدريبية
  {
    key: "course_management",
    icon: "/icons/course.svg",
    children: [
      {
        key: "courses",
        path: "/courses",
      },
      {
        key: "specializations",
        path: "/specializations",
      },
    ],
  },
  // 3. إدارة المستخدمين
  {
    key: "user_management",
    icon: "/icons/profile.svg",
    children: [
      {
        key: "students_management",
        path: "/students",
      },
      {
        key: "lecturers_management",
        path: "/lecturers",
      },
    ],
  },
  // 4. الهيكل الأكاديمي
  {
    key: "academic_hierarchy",
    icon: "/icons/build.svg",
    children: [
      {
        key: "countries",
        path: "/countries",
      },
      {
        key: "universities",
        path: "/university",
      },
      {
        key: "college",
        path: "/college",
      },
      {
        key: "academic_years",
        path: "/academic-years",
      },
      {
        key: "academic_semesters",
        path: "/semesters",
      },
      {
        key: "subjects",
        path: "/subjects",
      },
    ],
  },
  // 5. العملات (مستقلة خارج الهيكل الأكاديمي)
  {
    key: "currencies",
    icon: "/icons/finance.svg",
    path: "/currencies",
  },
  // 6. أكواد الخصم
  {
    key: "discount_codes",
    icon: "/icons/bxs--discount.svg",
    path: "/discount-codes",
  },
  // 7. إدارة المجالات
  {
    key: "categories",
    icon: "/icons/course.svg",
    path: "/category",
  },
  // 8. التقارير
  {
    key: "reports",
    icon: "/icons/reports.svg",
    path: "/reports",
  },
  // 9. إدارة البانرات
  {
    key: "banners",
    icon: "/icons/package.svg",
    path: "/banners",
  },
  // 10. الإشعارات
  {
    key: "notifications",
    icon: "/icons/mingcute--notification-line.svg",
    path: "/notifications",
  },
  // 11. الدعم الفني
  {
    key: "support",
    icon: "/icons/suport.svg",
    path: "/support",
  },
  // 12. المعلومات القانونية
  {
    key: "legal_info",
    icon: "/icons/invoice.svg",
    children: [
      {
        key: "terms_and_conditions",
        path: "/terms",
      },
      {
        key: "about_us",
        path: "/about-us",
      },
      {
        key: "common_questions",
        path: "/common-questions",
      },
    ],
  },
];

const logoutItem: SidebarItem = {
  key: "logout",
  icon: "/icons/logout.svg",
};

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  activeBg: "#F1F5F9",
  hoverBg: "#F8FAFC",
  activeIcon: "#1B8354",
  logout: "#DC2626",
  logoutHover: "#FEE2E2",
  border: "#E2E8F0",
};

function checkIsActive(path?: string, currentPath: string = ""): boolean {
  if (!path) return false;
  if (path === "/") return currentPath === "/" || currentPath === "";
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

function SidebarIcon({
  active = false,
  src,
  color,
}: {
  active?: boolean;
  src: string;
  color?: string;
}) {
  return (
    <SvgColor
      src={src}
      sx={{
        width: 20,
        height: 20,
        color: color || (active ? COLORS.activeIcon : COLORS.textMuted),
      }}
    />
  );
}

function SidebarItemButton({
  item,
  currentPathname,
  isRtl,
  expanded,
  onToggle,
  isLogout = false,
  depth = 0,
  onClick,
}: {
  item: SidebarItem;
  currentPathname: string;
  isRtl: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  isLogout?: boolean;
  depth?: number;
  onClick?: () => void;
}) {
  const t = useTranslations("Sidebar");
  const hasChildren = !!item.children?.length;
  const isExpandable = hasChildren && onToggle;

  const isCurrentActive = !isLogout && (
    hasChildren
      ? item.children!.some((child) => checkIsActive(child.path, currentPathname))
      : checkIsActive(item.path, currentPathname)
  );

  const isCurrentActiveLeaf = isCurrentActive && !hasChildren && !isLogout;

  const itemColor = isLogout
    ? COLORS.logout
    : isCurrentActiveLeaf
    ? COLORS.activeIcon
    : COLORS.text;
  const iconColor = isLogout ? COLORS.logout : undefined;

  const handleClick = () => {
    if (isExpandable) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  const buttonContent = (
    <ListItemButton
      onClick={handleClick}
      selected={isCurrentActiveLeaf}
      sx={{
        borderRadius: 1.5,
        gap: 1.5,
        minHeight: depth > 0 ? 38 : 44,
        mb: 0.5,
        px: 1.5,
        alignItems: "center",
        "&:hover": {
          bgcolor: isLogout ? COLORS.logoutHover : COLORS.hoverBg,
        },
        "&.Mui-selected": {
          bgcolor: COLORS.activeBg,
          "&:hover": { bgcolor: COLORS.activeBg },
        },
      }}
    >
      {/* 1. Leading Bullet Dot for Children, or SVG Icon for Parent */}
      {depth > 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: isCurrentActiveLeaf ? COLORS.activeIcon : "#1E293B",
              transition: "transform 0.15s ease",
              transform: isCurrentActiveLeaf ? "scale(1.3)" : "scale(1)",
            }}
          />
        </Box>
      ) : (
        item.icon && (
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 0,
              ml: 0,
              justifyContent: "center",
            }}
          >
            <SidebarIcon
              active={isCurrentActiveLeaf || (hasChildren && isCurrentActive)}
              src={item.icon}
              color={iconColor}
            />
          </ListItemIcon>
        )
      )}

      {/* 2. Text Label */}
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{
              fontWeight: isCurrentActiveLeaf ? 700 : depth > 0 ? 500 : 600,
              color: itemColor,
              fontSize: depth > 0 ? 13.5 : 14,
              lineHeight: 1.4,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {t(item.key)}
          </Typography>
        }
        sx={{
          my: 0,
          flexGrow: 1,
          textAlign: isRtl ? "right" : "left",
        }}
      />

      {/* 3. Expand / Collapse Arrow for Parent Groups */}
      {isExpandable && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 20,
          }}
        >
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 18,
              color: COLORS.textMuted,
              transition: "transform 0.2s ease-in-out",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </Box>
      )}
    </ListItemButton>
  );

  return (
    <>
      {item.path && !hasChildren ? (
        <Link href={item.path} style={{ textDecoration: "none", color: "inherit" }}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List
            disablePadding
            sx={{
              pr: isRtl ? 2 : 0,
              pl: isRtl ? 0 : 2,
            }}
          >
            {item.children!.map((child) => (
              <SidebarItemButton
                key={child.key}
                item={child}
                currentPathname={currentPathname}
                isRtl={isRtl}
                depth={depth + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const anchor = isRtl ? "right" : "left";
  const { logout } = useAuth();

  const [expandedItems, setExpandedItems] = useState<string[]>([
    "course_management",
    "user_management",
    "academic_hierarchy",
    "legal_info",
  ]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const drawer = (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
        height: "100%",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 1.5,
          pt: 2,
          pb: 1,
          ...scrollbar(),
        }}
      >
        <List disablePadding>
          {sidebarItems.map((item) => {
            const expanded = expandedItems.includes(item.key);

            return (
              <SidebarItemButton
                key={item.key}
                item={item}
                currentPathname={pathname}
                isRtl={isRtl}
                expanded={expanded}
                onToggle={() => toggleExpand(item.key)}
              />
            );
          })}
        </List>
      </Box>

      {/* Bottom Logout Item */}
      <Box
        sx={{
          px: 1.5,
          pb: 2,
          pt: 1,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <List disablePadding>
          <SidebarItemButton
            item={logoutItem}
            currentPathname={pathname}
            isRtl={isRtl}
            isLogout
            onClick={logout}
          />
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor={anchor}
      open={mdUp ? true : open}
      onClose={onClose}
      variant={mdUp ? "permanent" : "temporary"}
      ModalProps={{ keepMounted: true }}
      sx={{
        flexShrink: { md: 0 },
        width: { md: 280 },
        "& .MuiDrawer-paper": {
          bgcolor: "#FFFFFF",
          width: 280,
          boxSizing: "border-box",
          borderLeft: isRtl ? `1px solid ${COLORS.border}` : "none",
          borderRight: isRtl ? "none" : `1px solid ${COLORS.border}`,
          top: mdUp ? "64px" : undefined,
          height: mdUp ? "calc(100% - 64px)" : "100%",
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}

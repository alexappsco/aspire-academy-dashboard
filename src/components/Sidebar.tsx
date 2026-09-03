"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "src/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { scrollbar } from "src/theme/css";
import SvgColor from "src/components/svg-color";
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
      // {
      //   key: "students_management",
      //   path: "/students",
      // },
      {
        key: "lecturers_management",
        path: "/minutes-management",
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
  // {
  //   key: "reports",
  //   icon: "/icons/reports.svg",
  //   path: "/reports",
  // },
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
        key: "privacy_policy",
        path: "/privacy-policy",
      },
      {
        key: "common_questions",
        path: "/common-questions",
      },
    ],
  },
];

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  activeBg: "#EAF7F0",
  activeBgSoft: "#F4FBF7",
  hoverBg: "#F8FAFC",
  activeIcon: "#1B8354",
  activeBorder: "#1B8354",
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
  depth = 0,
}: {
  item: SidebarItem;
  currentPathname: string;
  isRtl: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  depth?: number;
}) {
  const t = useTranslations("Sidebar");
  const hasChildren = !!item.children?.length;
  const isExpandable = hasChildren && onToggle;

  const isCurrentActive = (
    hasChildren
      ? item.children!.some((child) => checkIsActive(child.path, currentPathname))
      : checkIsActive(item.path, currentPathname)
  );

  const isCurrentActiveLeaf = isCurrentActive && !hasChildren;
  const isActiveGroup = isCurrentActive && hasChildren;

  const itemColor = isCurrentActiveLeaf || isActiveGroup
    ? COLORS.activeIcon
    : COLORS.text;

  const handleClick = () => {
    if (isExpandable) {
      onToggle();
    }
  };

  const buttonContent = (
    <ListItemButton
      onClick={handleClick}
      selected={isCurrentActiveLeaf}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 1.5,
        gap: 1.5,
        minHeight: depth > 0 ? 38 : 44,
        mb: 0.5,
        px: 1.5,
        alignItems: "center",
        bgcolor: isActiveGroup ? COLORS.activeBgSoft : "transparent",
        boxShadow: isCurrentActiveLeaf ? "0 8px 18px rgba(27, 131, 84, 0.12)" : "none",
        transition: "background-color 0.2s ease, box-shadow 0.2s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 8,
          bottom: 8,
          width: 4,
          borderRadius: 999,
          bgcolor: isCurrentActiveLeaf ? COLORS.activeBorder : "transparent",
          ...(isRtl ? { right: 6 } : { left: 6 }),
        },
        "&:hover": {
          bgcolor: COLORS.hoverBg,
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
              bgcolor: isCurrentActiveLeaf ? COLORS.activeIcon : "#94A3B8",
              boxShadow: isCurrentActiveLeaf ? "0 0 0 4px rgba(27, 131, 84, 0.14)" : "none",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
              transform: isCurrentActiveLeaf ? "scale(1.45)" : "scale(1)",
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
              color={isActiveGroup ? COLORS.activeIcon : undefined}
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
              color: isActiveGroup ? COLORS.activeIcon : COLORS.textMuted,
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

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

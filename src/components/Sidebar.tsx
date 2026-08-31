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
  icon: string;
  path?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    key: "home",
    icon: "/icons/main.svg",
    path: "/",
  },
  {
    key: "course_management",
    icon: "/icons/course.svg",
    path: "/courses",
  },
  {
    key: "curriculum_management",
    icon: "/icons/curriculum.svg",
    path: "/curriculum",
  },
  {
    key: "booking_management",
    icon: "/icons/booking.svg",
    children: [
      { key: "home", icon: "/icons/main.svg", path: "/bookings" },
    ],
  },
  {
    key: "finance_payments",
    icon: "/icons/finance.svg",
    path: "/finance",
  },
  {
    key: "reports_analytics",
    icon: "/icons/reports.svg",
    children: [
      { key: "home", icon: "/icons/main.svg", path: "/reports" },
    ],
  },
  {
    key: "notifications",
    icon: "/icons/mingcute--notification-line.svg",
    path: "/notifications",
  },
  {
    key: "support",
    icon: "/icons/suport.svg",
    path: "/support",
  },
];

const bottomItems: SidebarItem[] = [
  {
    key: "settings",
    icon: "/icons/settings.svg",
    path: "/settings",
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

function SidebarIcon({ active = false, src, color }: { active?: boolean; src: string; color?: string }) {
  return (
    <SvgColor
      src={src}
      sx={{
        width: 22,
        height: 22,
        color: color || (active ? COLORS.activeIcon : COLORS.textMuted),
      }}
    />
  );
}

// function SidebarItemButton({
//   item,
//   active,
//   isRtl,
//   expanded,
//   onToggle,
//   isLogout = false,
//   depth = 0,
// }: {
//   item: SidebarItem;
//   active: boolean;
//   isRtl: boolean;
//   expanded?: boolean;
//   onToggle?: () => void;
//   isLogout?: boolean;
//   depth?: number;
// }) {
//   const t = useTranslations("Sidebar");
//   const hasChildren = !!item.children?.length;
//   const isExpandable = hasChildren && onToggle;

//   const itemColor = isLogout ? COLORS.logout : COLORS.text;
//   const iconColor = isLogout ? COLORS.logout : undefined;

//   const buttonContent = (
//     <ListItemButton
//       onClick={isExpandable ? onToggle : undefined}
//       selected={active && !hasChildren && !isLogout}
//       sx={{
//         borderRadius: 1.5,
//         gap: 1.5,
//         minHeight: 44,
//         mb: 0.5,
//         px: 1.5,
//         justifyContent: "flex-start",
//         "&:hover": {
//           bgcolor: isLogout ? COLORS.logoutHover : COLORS.hoverBg,
//         },
//         "&.Mui-selected": {
//           bgcolor: COLORS.activeBg,
//           "&:hover": { bgcolor: COLORS.activeBg },
//         },
//       }}
//     >
//       {/* 1. Leading Icon (Renders on Left for LTR, Right for RTL) */}
//       <ListItemIcon
//         sx={{
//           minWidth: 0,
//           justifyContent: "center",
//         }}
//       >
//         <SidebarIcon active={active && !hasChildren && !isLogout} src={item.icon} color={iconColor} />
//       </ListItemIcon>

//       {/* 2. Text Label */}
//       {/* <ListItemText
//         primary={
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: active && !hasChildren && !isLogout ? 600 : 400,
//               color: itemColor,
//               fontSize: 14,
//               lineHeight: 1.4,
//             }}
//           >
//             {t(item.key)}
//           </Typography>
//         }
//         sx={{ my: 0 }}
//       /> */}
//       {/* 2. Text Label */}
//       <ListItemText
//         primary={
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: active && !hasChildren && !isLogout ? 600 : 400,
//               color: itemColor,
//               fontSize: 14,
//               lineHeight: 1.4,
//               textAlign: isRtl ? "right" : "left",
//             }}
//           >
//             {t(item.key)}
//           </Typography>
//         }
//         sx={{
//           my: 0,
//           flex: 1,
//           textAlign: isRtl ? "right" : "left",
//           order: 2,
//         }}
//       />

//       {/* 3. Trailing Chevron Arrow (Renders on Right for LTR, Left for RTL) */}
//       {isExpandable && (
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             minWidth: 20,
//             ml: isRtl ? 0 : "auto",
//             mr: isRtl ? "auto" : 0,
//           }}
//         >
//           <KeyboardArrowDownRoundedIcon
//             sx={{
//               fontSize: 20,
//               color: COLORS.textMuted,
//               transition: "transform 0.2s ease-in-out",
//               transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
//             }}
//           />
//         </Box>
//       )}
//     </ListItemButton>
//   );

//   return (
//     <>
//       {item.path && !hasChildren ? (
//         <Link href={item.path} style={{ textDecoration: "none" }}>
//           {buttonContent}
//         </Link>
//       ) : (
//         buttonContent
//       )}

//       {hasChildren && (
//         <Collapse in={expanded} timeout="auto" unmountOnExit>
//           <List disablePadding sx={{ pl: isRtl ? 0 : 2.5, pr: isRtl ? 2.5 : 0 }}>
//             {item.children!.map((child) => (
//               <SidebarItemButton
//                 key={child.key}
//                 item={child}
//                 active={child.path ? active : false}
//                 isRtl={isRtl}
//                 depth={depth + 1}
//               />
//             ))}
//           </List>
//         </Collapse>
//       )}
//     </>
//   );
// }
// function SidebarItemButton({
//   item,
//   active,
//   isRtl,
//   expanded,
//   onToggle,
//   isLogout = false,
//   depth = 0,
// }: {
//   item: SidebarItem;
//   active: boolean;
//   isRtl: boolean;
//   expanded?: boolean;
//   onToggle?: () => void;
//   isLogout?: boolean;
//   depth?: number;
// }) {
//   const t = useTranslations("Sidebar");
//   const hasChildren = !!item.children?.length;
//   const isExpandable = hasChildren && onToggle;

//   const itemColor = isLogout ? COLORS.logout : COLORS.text;
//   const iconColor = isLogout ? COLORS.logout : undefined;

//   const buttonContent = (
//     <ListItemButton
//       onClick={isExpandable ? onToggle : undefined}
//       selected={active && !hasChildren && !isLogout}
//       sx={{
//         borderRadius: 1.5,
//         gap: 1.5,
//         minHeight: 44,
//         mb: 0.5,
//         px: 1.5,
//         alignItems: "center",
//         "&:hover": {
//           bgcolor: isLogout ? COLORS.logoutHover : COLORS.hoverBg,
//         },
//         "&.Mui-selected": {
//           bgcolor: COLORS.activeBg,
//           "&:hover": { bgcolor: COLORS.activeBg },
//         },
//       }}
//     >
//       {/* 1. Start Icon */}
//       <ListItemIcon
//         sx={{
//           minWidth: 0,
//           justifyContent: "center",
//         }}
//       >
//         <SidebarIcon active={active && !hasChildren && !isLogout} src={item.icon} color={iconColor} />
//       </ListItemIcon>

//       {/* 2. Label (Flexgrow fills remaining horizontal space) */}
//       <ListItemText
//         primary={
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: active && !hasChildren && !isLogout ? 600 : 400,
//               color: itemColor,
//               fontSize: 14,
//               lineHeight: 1.4,
//             }}
//           >
//             {t(item.key)}
//           </Typography>
//         }
//         sx={{
//           my: 0,
//           flexGrow: 1,
//         }}
//       />

//       {/* 3. End Chevron (Pushed automatically to the far edge) */}
//       {isExpandable && (
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             minWidth: 20,
//           }}
//         >
//           <KeyboardArrowDownRoundedIcon
//             sx={{
//               fontSize: 20,
//               color: COLORS.textMuted,
//               transition: "transform 0.2s ease-in-out",
//               transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
//             }}
//           />
//         </Box>
//       )}
//     </ListItemButton>
//   );

//   return (
//     <>
//       {item.path && !hasChildren ? (
//         <Link href={item.path} style={{ textDecoration: "none" }}>
//           {buttonContent}
//         </Link>
//       ) : (
//         buttonContent
//       )}

//       {hasChildren && (
//         <Collapse in={expanded} timeout="auto" unmountOnExit>
//           <List disablePadding sx={{ pl: isRtl ? 0 : 2.5, pr: isRtl ? 2.5 : 0 }}>
//             {item.children!.map((child) => (
//               <SidebarItemButton
//                 key={child.key}
//                 item={child}
//                 active={child.path ? active : false}
//                 isRtl={isRtl}
//                 depth={depth + 1}
//               />
//             ))}
//           </List>
//         </Collapse>
//       )}
//     </>
//   );
// }
function SidebarItemButton({
  item,
  active,
  isRtl,
  expanded,
  onToggle,
  isLogout = false,
  depth = 0,
}: {
  item: SidebarItem;
  active: boolean;
  isRtl: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  isLogout?: boolean;
  depth?: number;
}) {
  const t = useTranslations("Sidebar");
  const hasChildren = !!item.children?.length;
  const isExpandable = hasChildren && onToggle;

  const itemColor = isLogout ? COLORS.logout : COLORS.text;
  const iconColor = isLogout ? COLORS.logout : undefined;

  const buttonContent = (
    <ListItemButton
      onClick={isExpandable ? onToggle : undefined}
      selected={active && !hasChildren && !isLogout}
      sx={{
        borderRadius: 1.5,
        gap: 1.5,
        minHeight: 44,
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
      {/* 1. Main Icon */}
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: 0,
          ml: 0,
          justifyContent: "center",
        }}
      >
        <SidebarIcon active={active && !hasChildren && !isLogout} src={item.icon} color={iconColor} />
      </ListItemIcon>

      {/* 2. Text Label (aligned toward the icon with flex-grow pushing chevron) */}
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{
              fontWeight: active && !hasChildren && !isLogout ? 600 : 400,
              color: itemColor,
              fontSize: 14,
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

      {/* 3. Trailing Chevron Arrow */}
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
              fontSize: 20,
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
        <Link href={item.path} style={{ textDecoration: "none" }}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: isRtl ? 0 : 2.5, pr: isRtl ? 2.5 : 0 }}>
            {item.children!.map((child) => (
              <SidebarItemButton
                key={child.key}
                item={child}
                active={child.path ? active : false}
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

  const isActive = (path?: string) =>
    !path ? false : path === "/" ? pathname === path : pathname.startsWith(path);

  const isChildActive = (item: SidebarItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) return item.children.some((child) => isChildActive(child));
    return false;
  };

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
            const active = item.children ? isChildActive(item) : isActive(item.path);

            return (
              <SidebarItemButton
                key={item.key}
                item={item}
                active={active}
                isRtl={isRtl}
                expanded={expanded}
                onToggle={() => toggleExpand(item.key)}
              />
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          px: 1.5,
          pb: 2,
          pt: 1,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <List disablePadding>
          {bottomItems.map((item) => {
            const active = isActive(item.path);
            return (
              <SidebarItemButton
                key={item.key}
                item={item}
                active={active}
                isRtl={isRtl}
              />
            );
          })}

          <SidebarItemButton
            item={logoutItem}
            active={false}
            isRtl={isRtl}
            isLogout
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
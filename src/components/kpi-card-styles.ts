import { keyframes } from "@mui/system";
import type { SxProps, Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export const kpiFadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const KPI_CARD_SHADOW =
  "0 2px 4px rgba(15, 23, 42, 0.04), 0 8px 20px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(15, 23, 42, 0.06)";

export const KPI_CARD_SHADOW_HOVER =
  "0 4px 8px rgba(15, 23, 42, 0.06), 0 16px 32px rgba(15, 23, 42, 0.12), 0 28px 56px rgba(15, 23, 42, 0.1)";

export function getKpiCardSx(animationDelay?: string): SxProps<Theme> {
  return {
    p: { xs: 2, md: 2.25 },
    borderRadius: "16px",
    border: "1px solid #E8ECF1",
    bgcolor: "#FFFFFF",
    boxShadow: KPI_CARD_SHADOW,
    transition:
      "transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.35s ease, border-color 0.35s ease",
    animation: `${kpiFadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
    ...(animationDelay ? { animationDelay } : {}),
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: KPI_CARD_SHADOW_HOVER,
      borderColor: "#DDE3EA",
    },
  };
}

export const kpiCardHeaderSx: SystemStyleObject<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  mb: 1.25,
};

export const kpiLabelSx: SystemStyleObject<Theme> = {
  fontSize: 13,
  fontWeight: 600,
  color: "#64748B",
  letterSpacing: "0.01em",
  flex: 1,
  minWidth: 0,
};

export const kpiValueSx: SystemStyleObject<Theme> = {
  fontSize: { xs: 26, md: 30 },
  fontWeight: 800,
  lineHeight: 1.15,
  color: "#0F172A",
  letterSpacing: "-0.02em",
  fontFeatureSettings: '"tnum"',
};

export const kpiValueOfferSx: SystemStyleObject<Theme> = {
  fontSize: { xs: 18, md: 20 },
  fontWeight: 700,
  lineHeight: 1.35,
  color: "#0F172A",
};

export const kpiSubtitleSx: SystemStyleObject<Theme> = {
  fontSize: 13,
  fontWeight: 500,
  color: "#64748B",
  mt: 0.75,
};

export const kpiIconBoxSx: SystemStyleObject<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
};

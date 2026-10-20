import React, { useRef, useState } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";
import { Box, Button, Paper, Tooltip, Badge } from "@mui/material";
import { styled } from "@mui/material/styles";

interface LottieOption {
  loop: boolean;
  autoplay: boolean;
  animationData: object;
  rendererSettings: {
    preserveAspectRatio: string;
  };
  width?: number;
  height?: number;
}

interface MobileIconButtonProps {
  /** Alias used by bottom bars; forwarded to the underlying button when set */
  id?: string;
  badge?: string | number;
  onClick?: () => void;
  Icon?: React.ComponentType<any>;
  isFocused?: boolean;
  bgColor?: string;
  disabledOpacity?: number;
  focusIconColor?: string;
  disabled?: boolean;
  large?: boolean;
  tooltipTitle?: string;
  btnID?: string;
  buttonText?: string;
  lottieOption?: LottieOption;
}

const StyledButton = styled(Button)(({ theme }) => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textTransform: "none",
  padding: 0,
  minWidth: "auto",
}));

const IconContainer = styled(Box)<{ $mouseOver: boolean; $mouseDown: boolean; $disabledOpacity?: number }>(
  ({ $mouseOver, $mouseDown, $disabledOpacity }) => ({
    position: "relative",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    opacity: $disabledOpacity || 1,
    transform: `scale(${$mouseOver ? ($mouseDown ? 0.95 : 1.1) : 1})`,
    transition: "all 100ms",
    transitionTimingFunction: "linear",
  })
);

export const MobileIconButton: React.FC<MobileIconButtonProps> = ({
  id,
  badge,
  onClick,
  Icon,
  isFocused,
  bgColor,
  disabledOpacity,
  focusIconColor = "#fff",
  disabled = false,
  large = false,
  tooltipTitle,
  btnID,
  buttonText,
  lottieOption,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const openTooltip = () => {
    if (btnRef.current && tooltipRef.current) {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "bottom",
      });
    }
    setTooltipShow(true);
  };

  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 24 * (large ? 1.7 : 1);

  return (
    <>
      <Box ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        <Box sx={{ borderRadius: "8px" }}>
          <StyledButton
            id={id ?? btnID}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseDown={() => setMouseDown(true)}
            onMouseUp={() => setMouseDown(false)}
          >
            <IconContainer
              $mouseOver={mouseOver}
              $mouseDown={mouseDown}
              $disabledOpacity={disabledOpacity}
              sx={{ bgcolor: bgColor }}
            >
              {badge && (
                <Badge
                  badgeContent={badge}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -12,
                    "& .MuiBadge-badge": {
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                    },
                  }}
                />
              )}

              {lottieOption ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: "5px",
                    borderRadius: "5px",
                    bgcolor: bgColor,
                  }}
                >
                  <Box
                    sx={{
                      height: iconSize,
                      width: (iconSize * (lottieOption.width || 1)) / (lottieOption.height || 1),
                    }}
                  >
                    <Lottie
                      loop={lottieOption.loop}
                      autoPlay={lottieOption.autoplay}
                      animationData={lottieOption.animationData}
                      rendererSettings={{
                        preserveAspectRatio: lottieOption.rendererSettings.preserveAspectRatio,
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                Icon && (
                  <Icon
                    style={{
                      color: isFocused ? focusIconColor : "#95959E",
                      height: iconSize,
                      width: iconSize,
                    }}
                    fillcolor={isFocused ? focusIconColor : "#95959E"}
                  />
                )
              )}
            </IconContainer>
            {buttonText && (
              <Box component="p" sx={{ color: isFocused ? "white" : "text.secondary", fontSize: "0.875rem", m: 0 }}>
                {buttonText}
              </Box>
            )}
          </StyledButton>
        </Box>
      </Box>

      <Box
        ref={tooltipRef}
        sx={{
          zIndex: 999,
          display: tooltipShow ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pb: 1,
        }}
      >
        <Paper sx={{ borderRadius: 1, bgcolor: "black", p: 0.75 }}>
          <Box component="p" sx={{ color: "white", fontSize: "1rem", m: 0 }}>
            {tooltipTitle || ""}
          </Box>
        </Paper>
      </Box>
    </>
  );
};
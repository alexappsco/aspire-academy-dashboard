import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";
import { Box, Button, Paper, Typography } from "@mui/material";
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

interface OutlineIconTextButtonProps {
  onClick?: () => void;
  isFocused?: boolean;
  bgColor?: string;
  Icon?: React.ComponentType<any>;
  focusBGColor?: string;
  disabled?: boolean;
  renderRightComponent?: () => React.ReactNode;
  fillcolor?: string;
  lottieOption?: LottieOption | null;
  tooltipTitle?: string;
  btnID?: string;
  buttonText?: string;
  large?: boolean;
  isRequestProcessing?: boolean;
  textColor?: string;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) =>
    !["isFocused", "mouseOver", "focusBGColor", "bgColor"].includes(prop as string),
})<{ isFocused?: boolean; mouseOver?: boolean; focusBGColor?: string; bgColor?: string }>(
  ({ theme, isFocused, mouseOver, focusBGColor, bgColor }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    textTransform: "none",
    padding: 0,
    minWidth: "auto",
    backgroundColor: bgColor ? bgColor : isFocused ? "white" : "#2a2d3a",
    border: mouseOver
      ? "2px solid transparent"
      : focusBGColor
      ? `2px solid ${focusBGColor}`
      : bgColor
      ? "2px solid transparent"
      : "2px solid rgba(255, 255, 255, 0.2)",
    margin: theme.spacing(0.5, 1),
    cursor: "pointer",
    transition: "all 200ms ease-in-out",
    "&:hover": {
      backgroundColor: bgColor ? bgColor : isFocused ? "white" : "#3a3d4a",
    },
  })
);

const ButtonContent = styled(Box)<{ mouseOver: boolean; mouseDown: boolean; disabled?: boolean }>(
  ({ mouseOver, mouseDown, disabled }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    margin: "4px",
    borderRadius: "8px",
    overflow: "hidden",
    opacity: disabled ? 0.7 : 1,
    transform: `scale(${mouseOver ? (mouseDown ? 0.97 : 1.05) : 1})`,
    transition: "all 200ms linear",
  })
);

const OutlineIconTextButton: React.FC<OutlineIconTextButtonProps> = ({
  onClick,
  isFocused = false,
  bgColor,
  Icon,
  focusBGColor,
  disabled = false,
  renderRightComponent,
  fillcolor,
  lottieOption,
  tooltipTitle,
  btnID,
  buttonText,
  large = false,
  isRequestProcessing = false,
  textColor,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [blinkingState, setBlinkingState] = useState(1);
  const [tooltipShow, setTooltipShow] = useState(false);

  const btnRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const openTooltip = () => {
    if (btnRef.current && tooltipRef.current) {
      createPopper(btnRef.current, tooltipRef.current, { placement: "bottom" });
    }
    setTooltipShow(true);
  };

  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 22;

  const startBlinking = () => {
    intervalRef.current = setInterval(() => {
      setBlinkingState((s) => (s === 1 ? 0.4 : 1));
    }, 600);
  };

  const stopBlinking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBlinkingState(1);
  };

  useEffect(() => {
    if (isRequestProcessing) {
      startBlinking();
    } else {
      stopBlinking();
    }
    return () => stopBlinking();
  }, [isRequestProcessing]);

  return (
    <>
      <Box ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        <StyledButton
          id={btnID}
          isFocused={isFocused}
          mouseOver={mouseOver}
          focusBGColor={focusBGColor}
          bgColor={bgColor}
          disabled={disabled}
          onClick={onClick}
          onMouseEnter={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
          onMouseDown={() => setMouseDown(true)}
          onMouseUp={() => setMouseDown(false)}
          sx={{ opacity: blinkingState }}
        >
          <ButtonContent mouseOver={mouseOver} mouseDown={mouseDown} disabled={disabled}>
            {buttonText &&
              (lottieOption ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.5,
                    color: isFocused ? "#1c1f2e" : textColor || "white",
                  }}
                >
                  {buttonText}
                </Typography>
              ))}
          </ButtonContent>
          {typeof renderRightComponent === "function" && renderRightComponent()}
        </StyledButton>
      </Box>

      <Box
        ref={tooltipRef}
        sx={{
          zIndex: 999,
          display: tooltipShow ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pt: 0.5,
        }}
      >
        <Paper sx={{ borderRadius: 1, bgcolor: "black", p: 0.75 }}>
          <Typography sx={{ color: "white", fontSize: "1rem" }}>{tooltipTitle || ""}</Typography>
        </Paper>
      </Box>
    </>
  );
};

export default OutlineIconTextButton;
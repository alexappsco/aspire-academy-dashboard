import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import { createPopper } from '@popperjs/core';
import { Box, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

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

interface OutlinedButtonProps {
  bgColor?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  Icon?: React.ComponentType<any>;
  isFocused?: boolean;
  tooltip?: string;
  badge?: string | number;
  lottieOption?: LottieOption | null;
  disabledOpacity?: number;
  renderRightComponent?: () => React.ReactNode;
  disabled?: boolean;
  large?: boolean;
  btnID?: string;
  color?: string;
  focusIconColor?: string;
  isRequestProcessing?: boolean;
  borderColor?: string;
  buttonText?: string;
}

const StyledButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'none',
  padding: 0,
  minWidth: 'auto',
});

const ButtonContent = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== '$mouseOver' && prop !== '$mouseDown' && prop !== '$disabledOpacity',
})<{ $mouseOver: boolean; $mouseDown: boolean; $disabledOpacity?: number }>(
  ({ $mouseOver, $mouseDown, $disabledOpacity }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    margin: '4px',
    borderRadius: '8px',
    opacity: $disabledOpacity || 1,
    transform: `scale(${$mouseOver ? ($mouseDown ? 0.95 : 1.1) : 1})`,
    transition: 'all 200ms',
    transitionTimingFunction: 'linear',
  })
);

export const OutlinedButton: React.FC<OutlinedButtonProps> = ({
  bgColor,
  onClick,
  Icon,
  isFocused,
  tooltip,
  badge,
  lottieOption,
  disabledOpacity,
  renderRightComponent,
  disabled = false,
  large = false,
  btnID,
  color,
  focusIconColor = '#1C1F2E',
  isRequestProcessing = false,
  borderColor,
  buttonText,
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
      createPopper(btnRef.current, tooltipRef.current, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-50, 0],
            },
          },
        ],
      });
    }
    setTooltipShow(true);
  };

  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 24 * (large ? 1.7 : 1);

  const startBlinking = () => {
    intervalRef.current = setInterval(() => {
      setBlinkingState((s) => (s === 1 ? 0.4 : 1));
    }, 600);
  };

  const stopBlinking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setBlinkingState(1);
  };

  useEffect(() => {
    if (isRequestProcessing) {
      startBlinking();
    } else {
      stopBlinking();
    }

    return () => {
      stopBlinking();
    };
  }, [isRequestProcessing]);

  const getBgColor = () => {
    if (bgColor) return bgColor;
    if (isFocused) return 'white';
    return '#2A2D3A';
  };

  const getBorderStyle = () => {
    if (mouseOver) {
      return { border: '2px solid transparent' };
    }
    if (borderColor) {
      return { border: `2px solid ${borderColor}` };
    }
    if (bgColor) {
      return { border: '2px solid transparent' };
    }
    return { border: '2px solid rgba(255, 255, 255, 0.2)' };
  };

  return (
    <>
      <Box
        ref={btnRef}
        onMouseEnter={() => {
          setMouseOver(true);
          openTooltip();
        }}
        onMouseLeave={() => {
          setMouseOver(false);
          closeTooltip();
        }}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            bgcolor: getBgColor(),
            ...getBorderStyle(),
            m: { xs: 0.5, md: 1 },
            transition: 'all 200ms',
            transitionTimingFunction: 'ease-in-out',
            opacity: blinkingState,
          }}
        >
          <StyledButton
            id={btnID}
            disabled={disabled}
            onClick={onClick}
            sx={{ cursor: disabled ? 'default' : 'pointer' }}
          >
            <ButtonContent
              $mouseOver={mouseOver}
              $mouseDown={mouseDown}
              $disabledOpacity={disabledOpacity}
            >
              {Icon &&
                (lottieOption ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <>
                    <Icon
                      style={{
                        color: isFocused ? focusIconColor : color || '#fff',
                        height: iconSize,
                        width: iconSize,
                      }}
                      fillcolor={isFocused ? focusIconColor : color || '#fff'}
                    />
                    {badge && (
                      <Box
                        component="p"
                        sx={{ color: isFocused ? 'black' : 'white', fontSize: '1rem', ml: 2 }}
                      >
                        {badge}
                      </Box>
                    )}
                  </>
                ))}
            </ButtonContent>
            {buttonText && (
              <Box
                component="p"
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  mr: 2,
                  textAlign: 'center',
                }}
              >
                {buttonText}
              </Box>
            )}
          </StyledButton>
          {typeof renderRightComponent === 'function' && renderRightComponent()}
        </Box>
      </Box>

      <Box
        ref={tooltipRef}
        sx={{
          zIndex: 999,
          display: tooltipShow && (mouseOver || mouseDown) ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        <Paper sx={{ borderRadius: 1, bgcolor: 'black', p: 0.75 }}>
          <Box component="p" sx={{ color: 'white', fontSize: '1rem', m: 0 }}>
            {tooltip || ''}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

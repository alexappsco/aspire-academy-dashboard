import React, { useEffect, useRef, useState } from "react";
import animationData from "src/static/animations/join_meeting.json";
import Lottie from "lottie-react";
import useIsTab from "src/hooks/useIsTab";
import useIsMobile from "src/hooks/useIsMobile";
import { Box, Typography } from "@mui/material";

interface WaitingMessage {
  index: number;
  text: string;
}

const waitingMessages: WaitingMessage[] = [
  { index: 0, text: "Creating a room for you..." },
  { index: 1, text: "Almost there..." },
];

const WaitingToJoinScreen: React.FC = () => {
  const [message, setMessage] = useState<WaitingMessage>(waitingMessages[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTab = useIsTab();
  const isMobile = useIsMobile();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMessage((s) => (s.index === waitingMessages.length - 1 ? s : waitingMessages[s.index + 1]));
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const animationDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const size = isTab ? 200 : isMobile ? 200 : 250;

  return (
    <Box
      sx={{
        bgcolor: "#1a1c23",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ height: size, width: size }}>
          <Lottie
            loop={animationDefaultOptions.loop}
            autoPlay={animationDefaultOptions.autoplay}
            animationData={animationDefaultOptions.animationData}
            rendererSettings={{
              preserveAspectRatio: animationDefaultOptions.rendererSettings.preserveAspectRatio,
            }}
            style={{ height: "100%", width: "100%" }}
          />
        </Box>
        <Typography
          variant="h5"
          sx={{ color: "white", textAlign: "center", fontWeight: "bold", mt: 1 }}
        >
          {message.text}
        </Typography>
      </Box>
    </Box>
  );
};

export default WaitingToJoinScreen;

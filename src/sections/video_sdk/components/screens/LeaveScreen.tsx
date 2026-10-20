import { Box, Button, Typography } from "@mui/material";

interface LeaveScreenProps {
  setIsMeetingLeft: (value: boolean) => void;
}

export function LeaveScreen({ setIsMeetingLeft }: LeaveScreenProps) {
  return (
    <Box
      sx={{
        bgcolor: "#1a1c23",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" sx={{ color: "white" }}>
        You left the meeting!
      </Typography>
      <Box sx={{ mt: 12 }}>
        <Button
          onClick={() => setIsMeetingLeft(false)}
          sx={{
            bgcolor: "#9c27b0",
            color: "white",
            px: 8,
            py: 1.5,
            borderRadius: "8px",
            "&:hover": { bgcolor: "#ab47bc" },
          }}
        >
          Rejoin the Meeting
        </Button>
      </Box>
    </Box>
  );
}
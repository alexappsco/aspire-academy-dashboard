import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface MeetingDetailsScreenProps {
  onClickJoin: (meetingId: string) => void;
  _handleOnCreateMeeting: () => Promise<{ meetingId: string; err: string }>;
  participantName: string;
  setParticipantName: (name: string) => void;
  onClickStartMeeting: () => void;
}

export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  setParticipantName,
  onClickStartMeeting,
}: MeetingDetailsScreenProps) {
  const [meetingId, setMeetingId] = useState("");
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreateMeetingClicked, setIsCreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);

  const validateMeetingId = (id: string) => {
    return id.match("\\w{4}\\-\\w{4}\\-\\w{4}");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        width: "100%",
        p: { xs: 0.5, sm: 1, md: 1.5 },
      }}
    >
      {isCreateMeetingClicked ? (
        <Paper
          sx={{
            border: "1px solid #9e9e9e",
            borderRadius: "12px",
            px: 4,
            py: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
          }}
        >
          <Typography sx={{ color: "white", fontSize: "1rem" }}>{`Meeting code : ${meetingId}`}</Typography>
          <IconButton
            sx={{ ml: 2 }}
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 3000);
            }}
          >
            {isCopied ? (
              <CheckCircleIcon sx={{ color: "#4caf50", height: 20, width: 20 }} />
            ) : (
              <ContentCopyIcon sx={{ color: "white", height: 20, width: 20 }} />
            )}
          </IconButton>
        </Paper>
      ) : isJoinMeetingClicked ? (
        <>
          <TextField
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting Id"
            variant="outlined"
            error={meetingIdError}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2a2d3a",
                borderRadius: "12px",
                "& input": { color: "white", textAlign: "center" },
              },
            }}
          />
          {meetingIdError && (
            <Typography variant="caption" sx={{ color: "#f44336", mt: 0.5 }}>
              Please enter valid meetingId
            </Typography>
          )}
        </>
      ) : null}

      {(isCreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <TextField
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            variant="outlined"
            sx={{
              mt: 5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2a2d3a",
                borderRadius: "12px",
                "& input": { color: "white", textAlign: "center" },
              },
            }}
          />
          <Button
            disabled={participantName.length < 3}
            onClick={() => {
              if (isCreateMeetingClicked) {
                onClickStartMeeting();
              } else {
                if (validateMeetingId(meetingId)) {
                  onClickJoin(meetingId);
                } else {
                  setMeetingIdError(true);
                }
              }
            }}
            sx={{
              width: "100%",
              mt: 5,
              py: 1.5,
              borderRadius: "12px",
              bgcolor: participantName.length < 3 ? "#2a2d3a" : "#9c27b0",
              color: "white",
              "&:hover": {
                bgcolor: participantName.length < 3 ? "#2a2d3a" : "#ab47bc",
              },
            }}
          >
            {isCreateMeetingClicked ? "Start Now" : "Join Now"}
          </Button>
        </>
      )}

      {!isCreateMeetingClicked && !isJoinMeetingClicked && (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%" }}>
            <Button
              onClick={() => onClickJoin("")}
              sx={{
                width: "100%",
                bgcolor: "#9c27b0",
                color: "white",
                py: 1.5,
                borderRadius: "12px",
                "&:hover": { bgcolor: "#ab47bc" },
              }}
            >
              Join a meeting
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
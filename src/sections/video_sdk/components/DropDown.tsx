import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import React, { useEffect, useRef, useState } from "react";
import DropMIC from "../icons/DropDown/DropMIC";
import TestMic from "../icons/DropDown/TestMic";
import TestMicOff from "../icons/DropDown/TestMicOff";
import PauseButton from "../icons/DropDown/PauseButton";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import useIsMobile from "src/hooks/useIsMobile";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  LinearProgress,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface Device {
  deviceId: string;
  label: string;
  kind?: string;
}

interface DropDownProps {
  mics: Device[];
  changeMic: (deviceId: string) => void;
  customAudioStream: MediaStream | null;
  audioTrack: MediaStreamTrack | null;
  micOn: boolean;
  didDeviceChange: boolean;
  setDidDeviceChange: (value: boolean) => void;
  testSpeaker: boolean;
  setTestSpeaker: (value: boolean) => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "6px",
  padding: "4px 8px",
  width: "100%",
  fontSize: "1rem",
  fontWeight: "normal",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "black",
    outline: "1px solid #4a4a4a",
  },
}));

const DropDown: React.FC<DropDownProps> = ({
  mics,
  changeMic,
  customAudioStream,
  audioTrack,
  micOn,
  didDeviceChange,
  setDidDeviceChange,
  testSpeaker,
  setTestSpeaker,
}) => {
  const { setSelectedMic, selectedMic, selectedSpeaker, isMicrophonePermissionAllowed } =
    useMeetingAppContext();
  const [audioProgress, setAudioProgress] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording" | "stopped recording" | "playing">(
    "inactive"
  );
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volume, setVolume] = useState<number | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useIsMobile();

  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioAnalyserIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mimeType = "audio/webm";

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    if (audioTrack) {
      analyseAudio(audioTrack);
    } else {
      stopAudioAnalyse();
    }
  }, [audioTrack]);

  useEffect(() => {
    if (didDeviceChange) {
      setDidDeviceChange(false);
      if (mediaRecorder.current != null && mediaRecorder.current.state === "recording") {
        stopRecording();
      }
      setRecordingProgress(0);
      setRecordingStatus("inactive");
    }
  }, [didDeviceChange]);

  const analyseAudio = (audioTrack: MediaStreamTrack) => {
    const audioStream = new MediaStream([audioTrack]);
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);
    const volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);
      const volumeSum = volumes.reduce((sum, vol) => sum + vol);
      const averageVolume = volumeSum / volumes.length;
      setVolume(averageVolume);
    };
    audioAnalyserIntervalRef.current = setInterval(volumeCallback, 100);
  };

  const stopAudioAnalyse = () => {
    if (audioAnalyserIntervalRef.current) {
      clearInterval(audioAnalyserIntervalRef.current);
    }
  };

  const handlePlaying = () => {
    setRecordingStatus("playing");
    const audioTags = document.getElementsByTagName("audio");

    for (let i = 0; i < audioTags.length; i++) {
      (audioTags.item(i) as HTMLAudioElement)
        .setSinkId(selectedSpeaker.id ?? "")
        .then(() => {
          audioTags.item(i)?.play();
          audioTags.item(i)?.addEventListener("timeupdate", () => {
            const progress =
              ((audioTags.item(i) as HTMLAudioElement).currentTime / recordingDuration) * 100;
            setAudioProgress(progress);
          });
          audioTags.item(i)?.addEventListener("ended", () => {
            setAudioProgress(0);
          });
        })
        .catch((err) => console.error(err));
    }
  };

  const startRecording = async () => {
    if (!customAudioStream) return;
    setRecordingStatus("recording");

    try {
      const media = new MediaRecorder(customAudioStream, { mimeType: mimeType });
      mediaRecorder.current = media;
      mediaRecorder.current.start();
      let localAudioChunks: Blob[] = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(localAudioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        localAudioChunks = [];
        const elapsedTime = Date.now() - startTime;
        const durationInSeconds = elapsedTime / 1000;
        setRecordingDuration(durationInSeconds);
      };

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = (elapsedTime / 7000) * 100;
        setRecordingProgress(progress);
      });

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        stopRecording();
      }, 7000);
    } catch (err) {
      console.log("Error in MediaRecorder:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      setRecordingProgress(0);
      setRecordingStatus("stopped recording");
      if (intervalRef.current) clearInterval(intervalRef.current);
      mediaRecorder.current.stop();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (mediaRecorder.current != null && mediaRecorder.current.state === "recording") {
      stopRecording();
    }
    setRecordingProgress(0);
    setRecordingStatus("inactive");
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMicSelect = (deviceId: string, label: string) => {
    setSelectedMic({ id: deviceId, label });
    changeMic(deviceId);
    if (mediaRecorder.current != null && mediaRecorder.current.state === "recording") {
      stopRecording();
    }
    setRecordingProgress(0);
    setRecordingStatus("inactive");
    handleClose();
  };

  const testingSpeaker = () => {
    setTestSpeaker(!testSpeaker);
  };

  const volumePercentage = volume ? (volume / 256) * 100 : 0;

  return (
    <>
      <StyledButton
        onClick={handleClick}
        disabled={!isMicrophonePermissionAllowed}
        sx={{
          color: "white",
          opacity: !isMicrophonePermissionAllowed ? 0.5 : 1,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DropMIC fillColor="white" />
          <Typography
            sx={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maxWidth: 150,
            }}
          >
            {isMicrophonePermissionAllowed ? selectedMic?.label : "Permission Needed"}
          </Typography>
        </Box>
        <ChevronDownIcon style={{ height: 20, width: 20 }} />
      </StyledButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Paper sx={{ bgcolor: "#3a3a3a", minWidth: 250, p: 1 }}>
          {mics.map((item, index) =>
            item?.kind === "audioinput" ? (
              <MenuItem
                key={`mics_${index}`}
                onClick={() => handleMicSelect(item.deviceId, item.label)}
                selected={selectedMic?.label === item?.label}
                sx={{ display: "flex", gap: 1 }}
              >
                {selectedMic?.label === item?.label && <CheckIcon style={{ height: 20, width: 20 }} />}
                <Typography>{item?.label || `Mic ${index + 1}`}</Typography>
              </MenuItem>
            ) : null
          )}

          <Box sx={{ borderTop: "1px solid #555", my: 1 }} />

          {micOn ? (
            <Box sx={{ p: 1 }}>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 2 }}>
                  <TestMic />
                  <LinearProgress
                    variant="determinate"
                    value={volumePercentage}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#555",
                      "& .MuiLinearProgress-bar": { bgcolor: "white", opacity: 0.5 },
                    }}
                  />
                </Box>

                {!isMobile && (
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    {recordingStatus === "inactive" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={startRecording}
                        sx={{ bgcolor: "#555", "&:hover": { bgcolor: "#666" } }}
                      >
                        Record
                      </Button>
                    )}
                    {recordingStatus === "stopped recording" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handlePlaying}
                        sx={{ bgcolor: "#555", "&:hover": { bggcolor: "#666" } }}
                      >
                        Play
                      </Button>
                    )}
                    {(recordingStatus === "recording" || recordingStatus === "playing") && (
                      <Box sx={{ position: "relative", width: "100%" }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={stopRecording}
                          sx={{
                            bgcolor: "#555",
                            position: "relative",
                            overflow: "hidden",
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              height: "100%",
                              width: `${recordingStatus === "recording" ? recordingProgress : audioProgress}%`,
                              bgcolor: "#6F767E",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PauseButton />
                          </Box>
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {isMobile && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
                  {testSpeaker && (
                    <Typography variant="caption" sx={{ color: "#ccc", textAlign: "center" }}>
                      Speak to test mic & speakers...
                    </Typography>
                  )}
                  <Button
                    size="small"
                    onClick={testingSpeaker}
                    sx={{ mt: 1, bgcolor: "#555", "&:hover": { bgcolor: "#666" } }}
                  >
                    {!testSpeaker ? "Test Mic and Speaker" : "Stop Test"}
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, color: "#747B84" }}>
              <TestMicOff />
              <Typography>Unmute to test your mic</Typography>
            </Box>
          )}
        </Paper>
      </Menu>

      {audio && <audio src={audio} autoPlay={recordingStatus === "playing"} />}
    </>
  );
};

export default DropDown;
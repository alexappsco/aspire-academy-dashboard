import {
  Constants,
  useMeeting,
  usePubSub,
  useMediaDevice,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import recordingBlink from "src/static/animations/recording-blink.json";
import useIsRecording from "src/hooks/useIsRecording";
import RecordingIcon from "../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../icons/Bottombar/ParticipantsIcon";
import WhiteboardIcon from "../icons/Bottombar/WhiteboardIcon";
import EndIcon from "../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../icons/Bottombar/RaiseHandIcon";
import PipIcon from "../icons/Bottombar/PipIcon";
import { OutlinedButton } from "./buttons/OutlinedButton";
import useIsTab from "src/hooks/useIsTab";
import useIsMobile from "src/hooks/useIsMobile";
import { MobileIconButton } from "./buttons/MobileIconButton";
import { sideBarModes } from "src/utils/common";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Paper,
  Popover,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
} from "@mui/material";
import { createPopper } from "@popperjs/core";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import useMediaStream from "src/hooks/useMediaStream";

// Types
interface PipBTNProps {
  isMobile: boolean;
  isTab: boolean;
}

interface Device {
  deviceId: string;
  label: string;
  kind?: string;
}

interface Webcam {
  deviceId: string;
  label: string;
}

interface BottomBarProps {
  bottomBarHeight: string | number;
  setIsMeetingLeft: (value: boolean) => void;
}

interface BottomBarButtonTypes {
  END_CALL: string;
  CHAT: string;
  PARTICIPANTS: string;
  WHITEBOARD: string;
  SCREEN_SHARE: string;
  WEBCAM: string;
  MIC: string;
  RAISE_HAND: string;
  RECORDING: string;
  PIP: string;
  MEETING_ID_COPY: string;
}

interface OtherFeature {
  icon: string;
}

function PipBTN({ isMobile, isTab }: PipBTNProps) {
  const { pipMode, setPipMode } = useMeetingAppContext();

  const getRowCount = (length: number): number => {
    return length > 2 ? 2 : length > 0 ? 1 : 0;
  };

  const getColCount = (length: number): number => {
    return length < 2 ? 1 : length < 5 ? 2 : 3;
  };

  const pipWindowRef = useRef<HTMLVideoElement | null>(null);

  const togglePipMode = async () => {
    if (pipWindowRef.current) {
      await document.exitPictureInPicture();
      pipWindowRef.current = null;
      return;
    }

    if ("pictureInPictureEnabled" in document) {
      const source = document.createElement("canvas");
      const ctx = source.getContext("2d");

      if (!ctx) return;

      const pipVideo = document.createElement("video");
      pipWindowRef.current = pipVideo;
      pipVideo.autoplay = true;

      const stream = source.captureStream();
      pipVideo.srcObject = stream;
      drawCanvas();

      pipVideo.onloadedmetadata = () => {
        pipVideo.requestPictureInPicture();
      };
      await pipVideo.play();

      pipVideo.addEventListener("enterpictureinpicture", () => {
        drawCanvas();
        setPipMode(true);
      });

      pipVideo.addEventListener("leavepictureinpicture", () => {
        pipWindowRef.current = null;
        setPipMode(false);
        const tracks = (pipVideo.srcObject as MediaStream)?.getTracks();
        tracks?.forEach((track) => track.stop());
      });

      function drawCanvas() {
        if (!ctx) return;
        const videos = document.querySelectorAll("video");
        try {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, source.width, source.height);

          const rows = getRowCount(videos.length);
          const columns = getColCount(videos.length);
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              if (j + i * columns <= videos.length || videos.length === 1) {
                ctx.drawImage(
                  videos[j + i * columns],
                  j < 1 ? 0 : source.width / (columns / j),
                  i < 1 ? 0 : source.height / (rows / i),
                  source.width / columns,
                  source.height / rows
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
        }

        if (document.pictureInPictureElement === pipVideo) {
          requestAnimationFrame(drawCanvas);
        }
      }
    } else {
      alert("PIP is not supported by your browser");
    }
  };

  return isMobile || isTab ? (
    <MobileIconButton
      id="pip-btn"
      tooltipTitle={pipMode ? "Stop PiP" : "Start Pip"}
      buttonText={pipMode ? "Stop PiP" : "Start Pip"}
      isFocused={pipMode}
      Icon={PipIcon}
      onClick={togglePipMode}
      disabled={false}
    />
  ) : (
    <OutlinedButton
      Icon={PipIcon}
      onClick={togglePipMode}
      isFocused={pipMode}
      tooltip={pipMode ? "Stop PiP" : "Start Pip"}
      disabled={false}
    />
  );
}

const MicBTN = () => {
  const {
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    isMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const getMicsRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const { getMicrophones, getPlaybackDevices } = useMediaDevice({
    onDeviceChanged: async (devicesPromise) => {
      await getMicsRef.current?.();
      try {
        const list = await devicesPromise;
        const outputs = list.filter((device) => device.kind === "audiooutput");
        if (outputs.length > 0) {
          setSelectedSpeaker({
            id: outputs[0].deviceId,
            label: outputs[0].label,
          });
        }
      } catch {
        /* ignore device enumeration errors */
      }
    },
  });

  const mMeeting = useMeeting();
  const [mics, setMics] = useState<Device[]>([]);
  const [speakers, setSpeakers] = useState<Device[]>([]);
  const localMicOn = mMeeting?.localMicOn;
  const changeMic = mMeeting?.changeMic;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const getMics = async () => {
    const mics = await getMicrophones();
    const speakers = await getPlaybackDevices();
    mics && mics?.length && setMics(mics);
    speakers && speakers?.length && setSpeakers(speakers);
  };
  getMicsRef.current = getMics;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    getMics();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMicChange = (deviceId: string, label: string) => {
    setSelectedMic({ id: deviceId, label });
    changeMic(deviceId);
    handleClose();
  };

  const handleSpeakerChange = (deviceId: string, label: string) => {
    setSelectedSpeaker({ id: deviceId, label });
    handleClose();
  };

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <OutlinedButton
        Icon={localMicOn ? MicOnIcon : MicOffIcon}
        onClick={() => mMeeting.toggleMic()}
        bgColor={localMicOn ? "#2A2D3A" : "white"}
        borderColor={localMicOn ? "#ffffff33" : undefined}
        isFocused={localMicOn}
        focusIconColor={localMicOn ? "white" : undefined}
        tooltip="Toggle Mic"
        renderRightComponent={() => (
          <IconButton
            disabled={!isMicrophonePermissionAllowed}
            onClick={handleClick}
            size="small"
            sx={{ mt: 0.5, mr: 0.5 }}
          >
            <ChevronDownIcon
              style={{ height: 16, width: 16, color: localMicOn ? "white" : "black" }}
            />
          </IconButton>
        )}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box sx={{ bgcolor: "#1A1C23", p: 1, minWidth: 200 }}>
          <Box sx={{ p: 1, color: "white", fontWeight: "bold" }}>MICROPHONE</Box>
          {mics.map(({ deviceId, label }, index) => (
            <MenuItem
              key={`mics_${deviceId}`}
              onClick={() => handleMicChange(deviceId, label)}
              selected={deviceId === selectedMic.id}
              sx={{ color: "white" }}
            >
              {label || `Mic ${index + 1}`}
            </MenuItem>
          ))}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", my: 1 }} />
          <Box sx={{ p: 1, color: "white", fontWeight: "bold" }}>SPEAKER</Box>
          {speakers.map(({ deviceId, label }, index) => (
            <MenuItem
              key={`speakers_${deviceId}`}
              onClick={() => handleSpeakerChange(deviceId, label)}
              selected={deviceId === selectedSpeaker.id}
              sx={{ color: "white" }}
            >
              {label || `Speaker ${index + 1}`}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
};

const WebCamBTN = () => {
  const { selectedWebcam, setSelectedWebcam, isCameraPermissionAllowed } = useMeetingAppContext();
  const { getCameras } = useMediaDevice();
  const mMeeting = useMeeting();
  const [webcams, setWebcams] = useState<Webcam[]>([]);
  const { getVideoTrack } = useMediaStream();
  const localWebcamOn = mMeeting?.localWebcamOn;
  const changeWebcam = mMeeting?.changeWebcam;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const getWebcams = async () => {
    const webcams = await getCameras();
    webcams && webcams?.length && setWebcams(webcams);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    getWebcams();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleWebcamChange = async (deviceId: string, label: string) => {
    setSelectedWebcam({ id: deviceId, label });
    changeWebcam(deviceId);
    handleClose();
  };

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <OutlinedButton
        Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
        onClick={async () => {
          let stream: MediaStream | undefined;
          if (!localWebcamOn) {
            stream = (await getVideoTrack({ webcamId: selectedWebcam.id ?? undefined })) ?? undefined;
          }
          mMeeting.toggleWebcam(stream);
        }}
        bgColor={localWebcamOn ? "#2A2D3A" : "white"}
        borderColor={localWebcamOn ? "#ffffff33" : undefined}
        isFocused={localWebcamOn}
        focusIconColor={localWebcamOn ? "white" : undefined}
        tooltip="Toggle Webcam"
        renderRightComponent={() => (
          <IconButton
            disabled={!isCameraPermissionAllowed}
            onClick={handleClick}
            size="small"
            sx={{ mt: 0.5, mr: 0.5 }}
          >
            <ChevronDownIcon
              style={{ height: 16, width: 16, color: localWebcamOn ? "white" : "black" }}
            />
          </IconButton>
        )}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box sx={{ bgcolor: "#1A1C23", p: 1, minWidth: 200 }}>
          <Box sx={{ p: 1, color: "white", fontWeight: "bold" }}>WEBCAM</Box>
          {webcams.map(({ deviceId, label }, index) => (
            <MenuItem
              key={`webcams_${deviceId}`}
              onClick={() => handleWebcamChange(deviceId, label)}
              selected={deviceId === selectedWebcam.id}
              sx={{ color: "white" }}
            >
              {label || `Webcam ${index + 1}`}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
};

export function BottomBar({ bottomBarHeight, setIsMeetingLeft }: BottomBarProps) {
  const { sideBarMode, setSideBarMode, unreadChatCount, setUnreadChatCount } = useMeetingAppContext();
  const [fabOpen, setFabOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const RaiseHandBTN = ({ isMobile, isTab }: { isMobile: boolean; isTab: boolean }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const raiseHand = () => {
      try {
        publish("RAISE_HAND", { persist: false });
      } catch (e) {
        console.log("Error in pubsub", e);
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle="Raise hand"
        Icon={RaiseHandIcon}
        onClick={raiseHand}
        buttonText="Raise Hand"
      />
    ) : (
      <OutlinedButton onClick={raiseHand} tooltip="Raise Hand" Icon={RaiseHandIcon} />
    );
  };

  const RecordingBTN = () => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const handleClick = () => {
      if (isRecordingRef.current) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    const getTooltip = () => {
      if (recordingState === Constants.recordingEvents.RECORDING_STARTED) return "Stop Recording";
      if (recordingState === Constants.recordingEvents.RECORDING_STARTING) return "Starting Recording";
      if (recordingState === Constants.recordingEvents.RECORDING_STOPPED) return "Start Recording";
      if (recordingState === Constants.recordingEvents.RECORDING_STOPPING) return "Stopping Recording";
      return "Start Recording";
    };

    return (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={handleClick}
        isFocused={isRecording}
        tooltip={getTooltip()}
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }: { isMobile: boolean; isTab: boolean }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    const isDisabled = presenterId ? (localScreenShareOn ? false : true) : isMobile;

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : undefined
            : "Present Screen"
        }
        buttonText={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : undefined
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={() => toggleScreenShare()}
        disabled={isDisabled}
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={() => toggleScreenShare()}
        isFocused={localScreenShareOn}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : undefined
            : "Present Screen"
        }
        disabled={isDisabled}
      />
    );
  };

  const LeaveBTN = () => {
    const { leave } = useMeeting();
    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="#d32f2f"
        onClick={() => {
          leave();
          setIsMeetingLeft(true);
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }: { isMobile: boolean; isTab: boolean }) => {
    const isFocused = sideBarMode === sideBarModes.CHAT;

    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle="Chat"
        buttonText="Chat"
        Icon={ChatIcon}
        isFocused={isFocused}
        onClick={() => {
          setSideBarMode((s) => (s === sideBarModes.CHAT ? null : sideBarModes.CHAT));
          setUnreadChatCount(0);
        }}
        badge={unreadChatCount}
      />
    ) : (
      <OutlinedButton
        Icon={ChatIcon}
        onClick={() => {
          setSideBarMode((s) => (s === sideBarModes.CHAT ? null : sideBarModes.CHAT));
          setUnreadChatCount(0);
        }}
        isFocused={isFocused}
        tooltip="View Chat"
        badge={unreadChatCount}
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }: { isMobile: boolean; isTab: boolean }) => {
    const { participants } = useMeeting();
    const participantCount = new Map(participants)?.size;
    const isFocused = sideBarMode === sideBarModes.PARTICIPANTS;

    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle="Participants"
        isFocused={isFocused}
        buttonText="Participants"
        disabledOpacity={1}
        Icon={ParticipantsIcon}
        onClick={() =>
          setSideBarMode((s) => (s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS))
        }
        badge={participantCount}
      />
    ) : (
      <OutlinedButton
        Icon={ParticipantsIcon}
        onClick={() =>
          setSideBarMode((s) => (s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS))
        }
        isFocused={isFocused}
        tooltip="View Participants"
        badge={participantCount}
      />
    );
  };

  const WhiteboardBTN = ({ isMobile, isTab }: { isMobile: boolean; isTab: boolean }) => {
    const isFocused = sideBarMode === sideBarModes.WHITEBOARD;

    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle="Whiteboard"
        isFocused={isFocused}
        buttonText="Whiteboard"
        Icon={WhiteboardIcon}
        onClick={() =>
          setSideBarMode((s) => (s === sideBarModes.WHITEBOARD ? null : sideBarModes.WHITEBOARD))
        }
      />
    ) : (
      <OutlinedButton
        Icon={WhiteboardIcon}
        onClick={() =>
          setSideBarMode((s) => (s === sideBarModes.WHITEBOARD ? null : sideBarModes.WHITEBOARD))
        }
        isFocused={isFocused}
        tooltip="Whiteboard"
      />
    );
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);

    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", ml: { xs: 0, lg: 0 }, mt: { xs: 4, xl: 0 } }}>
        <Paper
          sx={{
            display: "flex",
            border: "2px solid #3F4346",
            p: 1,
            borderRadius: "6px",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
          }}
        >
          <Box component="h1" sx={{ color: "white", fontSize: "1rem", m: 0 }}>
            {meetingId}
          </Box>
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon style={{ height: 20, width: 20, color: "#4caf50" }} />
            ) : (
              <ClipboardIcon style={{ height: 20, width: 20, color: "white" }} />
            )}
          </IconButton>
        </Paper>
      </Box>
    );
  };

  const BottomBarButtonTypes: BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: "END_CALL",
      CHAT: "CHAT",
      PARTICIPANTS: "PARTICIPANTS",
      WHITEBOARD: "WHITEBOARD",
      SCREEN_SHARE: "SCREEN_SHARE",
      WEBCAM: "WEBCAM",
      MIC: "MIC",
      RAISE_HAND: "RAISE_HAND",
      RECORDING: "RECORDING",
      PIP: "PIP",
      MEETING_ID_COPY: "MEETING_ID_COPY",
    }),
    []
  );

  const otherFeatures: OtherFeature[] = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.PIP },
    { icon: BottomBarButtonTypes.SCREEN_SHARE },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.WHITEBOARD },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
  ];

  if (isMobile || isTab) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: bottomBarHeight }}>
        <LeaveBTN />
        <MicBTN />
        <WebCamBTN />
        <RecordingBTN />
        <OutlinedButton Icon={EllipsisHorizontalIcon} onClick={() => setFabOpen(true)} />

        <Dialog open={fabOpen} onClose={() => setFabOpen(false)} fullScreen>
          <DialogContent sx={{ bgcolor: "#1A1C23", p: 0 }}>
            <Box sx={{ bgcolor: "#1A1C23", py: 6 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 1 }}>
                {otherFeatures.map(({ icon }, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "center",
                      gridColumn: icon === BottomBarButtonTypes.MEETING_ID_COPY ? "span 7" : "span 4",
                    }}
                  >
                    {icon === BottomBarButtonTypes.RAISE_HAND && <RaiseHandBTN isMobile={isMobile} isTab={isTab} />}
                    {icon === BottomBarButtonTypes.SCREEN_SHARE && (
                      <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
                    )}
                    {icon === BottomBarButtonTypes.CHAT && <ChatBTN isMobile={isMobile} isTab={isTab} />}
                    {icon === BottomBarButtonTypes.PARTICIPANTS && (
                      <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
                    )}
                    {/* {icon === BottomBarButtonTypes.WHITEBOARD && (
                      <WhiteboardBTN isMobile={isMobile} isTab={isTab} />
                    )} */}
                    {icon === BottomBarButtonTypes.MEETING_ID_COPY && <MeetingIdCopyBTN />}
                    {icon === BottomBarButtonTypes.PIP && <PipBTN isMobile={isMobile} isTab={isTab} />}
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, px: { xs: 2, lg: 2, xl: 6 }, pb: 2 }}>
      <MeetingIdCopyBTN />

      <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <RecordingBTN />
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        <PipBTN isMobile={isMobile} isTab={isTab} />
        <LeaveBTN />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
        {/* <WhiteboardBTN isMobile={isMobile} isTab={isTab} /> */}
      </Box>
    </Box>
  );
}
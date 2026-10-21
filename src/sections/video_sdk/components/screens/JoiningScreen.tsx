import React, { useEffect, useRef, useState } from 'react';
import { MeetingDetailsScreen } from '../MeetingDetailsScreen';
import { createMeeting, joinMeeting, getProfile } from 'src/actions/api';
import ConfirmBox from '../ConfirmBox';

import { toast } from 'react-toastify';
import { Constants, useMediaDevice } from '@videosdk.live/react-sdk';

import NetworkStats from '../NetworkStats';
import DropDownCam from '../DropDownCam';
import DropDownSpeaker from '../DropDownSpeaker';
import DropDown from '../DropDown';
import useMediaStream from 'src/hooks/useMediaStream';
import useIsMobile from 'src/hooks/useIsMobile';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import {
  Box,
  Container,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIconCustom from '@mui/icons-material/MicOff';
import MicOnIcon from '../../icons/Bottombar/MicOnIcon';
import MicOffIcon from '../../icons/Bottombar/MicOffIcon';
import WebcamOnIcon from '../../icons/Bottombar/WebcamOnIcon';
import WebcamOffIcon from '../../icons/Bottombar/WebcamOffIcon';
import MicPermissionDenied from '../../icons/MicPermissionDenied';
import CameraPermissionDenied from '../../icons/CameraPermissionDenied';

interface Device {
  deviceId: string;
  label: string;
  kind?: string;
}

interface JoiningScreenProps {
  videoSessionId?: string;
  participantName: string;
  participantId: string;
  setParticipantName: (name: string) => void;
  setParticipantId: (id: string) => void;
  setMeetingId: (id: string) => void;
  setToken: (token: string) => void;
  setMicOn: (value: boolean) => void;
  setWebcamOn: (value: boolean) => void;
  onClickStartMeeting: (token?: string, meetingId?: string, name?: string, id?: string) => void;
  customAudioStream: MediaStream | null;
  customVideoStream: MediaStream | null;
  setCustomAudioStream: (stream: MediaStream | null) => void;
  setCustomVideoStream: (stream: MediaStream | null) => void;
  micOn: boolean;
  webcamOn: boolean;
  startMeeting: boolean;
  setIsMeetingLeft: (value: boolean) => void;
}

const ButtonWithTooltip: React.FC<{
  onClick: () => void;
  onState: boolean;
  OnIcon: React.ComponentType<any>;
  OffIcon: React.ComponentType<any>;
}> = ({ onClick, onState, OnIcon, OffIcon }) => {
  return (
    <Tooltip title={onState ? 'Turn off' : 'Turn on'}>
      <IconButton
        onClick={onClick}
        sx={{
          bgcolor: onState ? 'white' : '#d32f2f',
          width: 48,
          height: 48,
          '&:hover': { bgcolor: onState ? '#f5f5f5' : '#b71c1c' },
        }}
      >
        {onState ? (
          <OnIcon fillcolor="#050A0E" style={{ color: '#050A0E' }} />
        ) : (
          <OffIcon fillcolor="#fff" style={{ color: '#fff' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export function JoiningScreen({
  videoSessionId,
  participantName,
  participantId,
  setParticipantName,
  setParticipantId,
  setMeetingId,
  setToken,
  setMicOn,
  setWebcamOn,
  onClickStartMeeting,
  customAudioStream,
  customVideoStream,
  setCustomAudioStream,
  setCustomVideoStream,
  micOn,
  webcamOn,
  startMeeting: _startMeeting,
  setIsMeetingLeft: _setIsMeetingLeft,
}: JoiningScreenProps) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const isMobile = useIsMobile();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [{ webcams, mics, speakers }, setDevices] = useState<{
    webcams: Device[];
    mics: Device[];
    speakers: Device[];
  }>({
    webcams: [],
    mics: [],
    speakers: [],
  });

  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const onDeviceChangedRef = useRef<(() => void) | null>(null);
  const { checkPermissions, getCameras, getMicrophones, requestPermission, getPlaybackDevices } =
    useMediaDevice({ onDeviceChanged: () => onDeviceChangedRef.current?.() });

  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [didDeviceChange, setDidDeviceChange] = useState(false);
  const [testSpeaker, setTestSpeaker] = useState(false);

  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioAnalyserIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const permissionAvailable = useRef({ isCameraPermissionAllowed, isMicrophonePermissionAllowed });
  const webcamRef = useRef(webcamOn);
  const micRef = useRef(micOn);

  useEffect(() => {
    webcamRef.current = webcamOn;
  }, [webcamOn]);

  useEffect(() => {
    micRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    permissionAvailable.current = { isCameraPermissionAllowed, isMicrophonePermissionAllowed };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn && audioTrack) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (micOn) {
      if (audioTrackRef.current && audioTrackRef.current !== audioTrack) {
        audioTrackRef.current.stop();
      }
      audioTrackRef.current = audioTrack;
      if (audioTrack && audioPlayerRef.current) {
        const audioSrcObject = new MediaStream([audioTrack]);
        audioPlayerRef.current.srcObject = audioSrcObject;
        audioPlayerRef.current.play().catch((error) => console.log('audio play error', error));
      } else if (audioPlayerRef.current) {
        audioPlayerRef.current.srcObject = null;
      }
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {
      if (videoTrackRef.current && videoTrackRef.current !== videoTrack) {
        videoTrackRef.current.stop();
      }
      videoTrackRef.current = videoTrack;
      if (videoTrack && videoPlayerRef.current) {
        const videoSrcObject = new MediaStream([videoTrack]);
        videoPlayerRef.current.srcObject = videoSrcObject;
        videoPlayerRef.current.play().catch((error) => console.log('error', error));
      } else if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = null;
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => {
    if (isCameraPermissionAllowed) getCameraDevices();
  }, [isCameraPermissionAllowed]);

  useEffect(() => {
    if (isMicrophonePermissionAllowed) getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => {};
  }, []);

  const toggleWebcam = () => {
    if (webcamOn) {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const toggleMic = () => {
    if (micOn) {
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId: string) => {
    if (webcamOn) {
      if (videoTrackRef.current) videoTrackRef.current.stop();
      const stream = await getVideoTrack({ webcamId: deviceId });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      setVideoTrack(videoTracks?.length ? videoTracks[0] : null);
    }
  };

  const changeMic = async (deviceId: string) => {
    if (micOn) {
      if (audioTrackRef.current) audioTrackRef.current.stop();
      const stream = await getAudioTrack({ micId: deviceId });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      if (audioAnalyserIntervalRef.current) clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTracks?.length ? audioTracks[0] : null);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }: { mic: boolean; webcam: boolean }) => {
    if (mic) {
      const stream = await getAudioTrack({ micId: selectedMic.id ?? undefined });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      setAudioTrack(audioTracks?.length ? audioTracks[0] : null);
    }
    if (webcam) {
      const stream = await getVideoTrack({ webcamId: selectedWebcam?.id ?? undefined });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      setVideoTrack(videoTracks?.length ? videoTracks[0] : null);
    }
  };

  const startMuteListener = async () => {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) setDlgMuted(true);
      currentAudioTrack.addEventListener('mute', () => setDlgMuted(true));
    }
  };

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  const requestAudioVideoPermission = async (mediaType?: string) => {
    try {
      const permission = await requestPermission(mediaType as any);
      if (isFirefox) {
        const isVideoAllowed = permission.get('video');
        setIsCameraPermissionAllowed(isVideoAllowed ?? false);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
        const isAudioAllowed = permission.get('audio');
        setIsMicrophonePermissionAllowed(isAudioAllowed ?? false);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }
      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed ?? false);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }
      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed ?? false);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }
    } catch (ex) {
      console.log('Error in requestPermission ', ex);
    }
  };

  const onDeviceChanged = () => {
    setDidDeviceChange(true);
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  };
  onDeviceChangedRef.current = onDeviceChanged;

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(Constants.permission.VIDEO);
      const microphonePermissionAllowed = checkAudioVideoPermission.get(Constants.permission.AUDIO);
      setIsCameraPermissionAllowed(cameraPermissionAllowed ?? false);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed ?? false);
      if (microphonePermissionAllowed) {
        setMicOn(true);
        getDefaultMediaTracks({ mic: true, webcam: false });
      } else {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      if (cameraPermissionAllowed) {
        setWebcamOn(true);
        getDefaultMediaTracks({ mic: false, webcam: true });
      } else {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissionAvailable.current?.isCameraPermissionAllowed) {
        const webcams = await getCameras();
        if (webcams?.length) {
          setSelectedWebcam({ id: webcams[0]?.deviceId, label: webcams[0]?.label });
          setDevices((prev) => ({ ...prev, webcams }));
        }
      }
    } catch (err) {
      console.log('Error in getting camera devices', err);
    }
  };

  const getAudioDevices = async () => {
    try {
      if (permissionAvailable.current?.isMicrophonePermissionAllowed) {
        const mics = await getMicrophones();
        const speakers = await getPlaybackDevices();
        if (mics.length) startMuteListener();
        if (speakers.length) {
          setSelectedSpeaker({ id: speakers[0]?.deviceId, label: speakers[0]?.label });
        }
        if (mics.length) {
          setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        }
        setDevices((prev) => ({ ...prev, mics, speakers }));
      }
    } catch (err) {
      console.log('Error in getting audio devices', err);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (videoSessionId && !_startMeeting) {
        try {
          // جلب بيانات الحساب الشخصي فقط عند التحميل
          const profile = await getProfile();
          if (profile.name) setParticipantName(profile.name);
          if (profile.id) setParticipantId(profile.id);
        } catch (error) {
          console.error('[Profile Load] Error:', error);
        }
      }
    };
    fetchProfileData();
  }, [videoSessionId]);
  console.log('[Profile Load] Fetching profile data for session:', videoSessionId);

  return (
    <Box
      sx={{
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100vh',
        bgcolor: '#1a1c23',
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4, lg: 6 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 0.5, sm: 2, lg: 3 },
              }}
            >
              <Box sx={{ position: 'relative', width: '100%' }}>
                <Box sx={{ position: 'relative', height: isMobile ? '45vh' : '55vh' }}>
                  <Box sx={{ position: 'absolute', zIndex: 10, right: 0, top: 8 }}>
                    <NetworkStats />
                  </Box>

                  {isMobile && (
                    <audio
                      autoPlay
                      playsInline
                      muted={!testSpeaker}
                      ref={audioPlayerRef}
                      style={{ display: 'none' }}
                    />
                  )}

                  <video
                    autoPlay
                    playsInline
                    muted
                    ref={videoPlayerRef}
                    style={{
                      backgroundColor: '#1c1c1c',
                      transform: 'scaleX(-1)',
                      WebkitTransform: 'scaleX(-1)',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 10,
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 16, xl: 24 },
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    {isMicrophonePermissionAllowed ? (
                      <ButtonWithTooltip
                        onClick={toggleMic}
                        onState={micOn}
                        OnIcon={MicOnIcon}
                        OffIcon={MicOffIcon}
                      />
                    ) : (
                      <MicPermissionDenied />
                    )}
                    {isCameraPermissionAllowed ? (
                      <ButtonWithTooltip
                        onClick={toggleWebcam}
                        onState={webcamOn}
                        OnIcon={WebcamOnIcon}
                        OffIcon={WebcamOffIcon}
                      />
                    ) : (
                      <CameraPermissionDenied />
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    mt: 2,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <DropDown
                      mics={mics}
                      changeMic={changeMic}
                      customAudioStream={customAudioStream}
                      audioTrack={audioTrack}
                      micOn={micOn}
                      didDeviceChange={didDeviceChange}
                      setDidDeviceChange={setDidDeviceChange}
                      testSpeaker={testSpeaker}
                      setTestSpeaker={setTestSpeaker}
                    />
                  </Box>
                  {!isMobile && (
                    <Box sx={{ flex: 1 }}>
                      <DropDownSpeaker speakers={speakers} />
                    </Box>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <DropDownCam changeWebcam={changeWebcam} webcams={webcams} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <MeetingDetailsScreen
                participantName={participantName}
                setParticipantName={setParticipantName}
                onClickStartMeeting={onClickStartMeeting}
                onClickJoin={async () => {
                  console.log('[Meeting Init] Immediate join requested', { videoSessionId });

                  if (!videoSessionId) {
                    toast.error('Missing video session ID');
                    return;
                  }

                  const { token, roomId, participantId: joinedParticipantId, message } = await joinMeeting({
                    videoSessionId,
                  });

                  if (roomId && token) {
                    const activeParticipantId = joinedParticipantId || participantId;
                    if (activeParticipantId) setParticipantId(activeParticipantId);
                    setToken(token);
                    setMeetingId(roomId);
                    onClickStartMeeting(token, roomId, participantName, activeParticipantId);
                  } else {
                    toast.error(message || 'هذا الاجتماع لم يتم إنشاؤه بعد من قبل المدرس.');
                  }
                }}
                _handleOnCreateMeeting={async () => {
                  console.log('[Meeting Init] MeetingDetailsScreen rendered', {
                    participantName,
                    videoSessionId,
                  });
                  console.log('[Meeting Init] Attempting to create meeting', { videoSessionId });

                  if (!videoSessionId) {
                    return { meetingId: '', err: 'Missing video session ID' };
                  }

                  const { token, roomId, message } = await createMeeting({
                    videoSessionId: videoSessionId,
                  });

                  if (roomId && token) {
                    console.log('[Meeting Init] Created meeting:', { roomId, token });
                    setToken(token);
                    setMeetingId(roomId);
                    return { meetingId: roomId, err: '' };
                  } else {
                    return { meetingId: '', err: message || 'Failed to create meeting' };
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => setDlgMuted(false)}
        title="System mic is muted"
        subTitle="Your default microphone is muted, please unmute it or increase audio input volume from system settings."
      />

      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => setDlgDevices(false)}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </Box>
  );
}

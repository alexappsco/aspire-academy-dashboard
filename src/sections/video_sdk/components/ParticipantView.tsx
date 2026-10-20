import { useParticipant, VideoPlayer } from '@videosdk.live/react-sdk';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import useIsMobile from 'src/hooks/useIsMobile';
import useIsTab from 'src/hooks/useIsTab';
import useWindowSize from 'src/hooks/useWindowSize';
import MicOffSmallIcon from '../icons/MicOffSmallIcon';
import NetworkIcon from '../icons/NetworkIcon';
import SpeakerIcon from '../icons/SpeakerIcon';
import { getQualityScore, nameTructed } from 'src/utils/common';
import * as ReactDOM from 'react-dom';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Popover,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { styled } from '@mui/material/styles';

interface CornerDisplayNameProps {
  participantId: string;
  isPresenting: boolean;
  displayName: string;
  isLocal: boolean;
  micOn: boolean;
  mouseOver: boolean;
  isActiveSpeaker: boolean;
}

interface QualityStateItem {
  label: string;
  audio: string;
  video: string;
}

const StyledPopoverPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1a1c23',
  borderRadius: 8,
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  overflow: 'hidden',
}));

export const CornerDisplayName: React.FC<CornerDisplayNameProps> = ({
  participantId,
  isPresenting,
  displayName,
  isLocal,
  micOn,
  mouseOver,
  isActiveSpeaker,
}) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });
  const { height: windowHeight } = useWindowSize();
  const { selectedSpeaker } = useMeetingAppContext();

  const [statsBoxHeightRef, setStatsBoxHeightRef] = useState<HTMLDivElement | null>(null);
  const [statsBoxWidthRef, setStatsBoxWidthRef] = useState<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const statsBoxHeight = useMemo(() => statsBoxHeightRef?.offsetHeight, [statsBoxHeightRef]);
  const statsBoxWidth = useMemo(() => statsBoxWidthRef?.offsetWidth, [statsBoxWidthRef]);

  const analyzerSize = isXLDesktop ? 32 : isLGDesktop ? 28 : isTab ? 24 : isMobile ? 20 : 18;

  const show = useMemo(() => mouseOver, [mouseOver]);

  const {
    webcamStream,
    micStream,
    screenShareStream,
    getVideoStats,
    getAudioStats,
    getShareStats,
    getShareAudioStats,
  } = useParticipant(participantId);

  const statsIntervalIdRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [score, setScore] = useState<number>(100);
  const [audioStats, setAudioStats] = useState<any[]>([]);
  const [videoStats, setVideoStats] = useState<any[]>([]);

  const updateStats = async () => {
    let stats: any[] = [];
    let audioStatsData: any[] = [];
    let videoStatsData: any[] = [];

    if (isPresenting) {
      stats = await getShareStats();
    } else if (webcamStream) {
      stats = await getVideoStats();
    } else if (micStream) {
      stats = await getAudioStats();
    }

    if (webcamStream || micStream || isPresenting) {
      videoStatsData = isPresenting ? await getShareStats() : await getVideoStats();
      audioStatsData = isPresenting ? await getShareAudioStats() : await getAudioStats();
    }

    const calculatedScore = stats && stats.length > 0 ? getQualityScore(stats[0]) : 100;
    setScore(calculatedScore);
    setAudioStats(audioStatsData);
    setVideoStats(videoStatsData);
  };

  const qualityStateArray: QualityStateItem[] = [
    { label: '', audio: 'Audio', video: 'Video' },
    {
      label: 'Latency',
      audio: audioStats && audioStats[0]?.rtt ? `${audioStats[0]?.rtt} ms` : '-',
      video: videoStats && videoStats[0]?.rtt ? `${videoStats[0]?.rtt} ms` : '-',
    },
    {
      label: 'Jitter',
      audio:
        audioStats && audioStats[0]?.jitter
          ? `${parseFloat(audioStats[0]?.jitter).toFixed(2)} ms`
          : '-',
      video:
        videoStats && videoStats[0]?.jitter
          ? `${parseFloat(videoStats[0]?.jitter).toFixed(2)} ms`
          : '-',
    },
    {
      label: 'Packet Loss',
      audio: audioStats?.[0]?.packetsLost
        ? `${((audioStats[0]?.packetsLost * 100) / audioStats[0]?.totalPackets).toFixed(2)}%`
        : '-',
      video: videoStats?.[0]?.packetsLost
        ? `${((videoStats[0]?.packetsLost * 100) / videoStats[0]?.totalPackets).toFixed(2)}%`
        : '-',
    },
    {
      label: 'Bitrate',
      audio:
        audioStats && audioStats[0]?.bitrate
          ? `${parseFloat(audioStats[0]?.bitrate).toFixed(2)} kb/s`
          : '-',
      video:
        videoStats && videoStats[0]?.bitrate
          ? `${parseFloat(videoStats[0]?.bitrate).toFixed(2)} kb/s`
          : '-',
    },
    {
      label: 'Frame rate',
      audio: '-',
      video:
        videoStats &&
          (videoStats[0]?.size?.framerate === null || videoStats[0]?.size?.framerate === undefined)
          ? '-'
          : `${videoStats ? videoStats[0]?.size?.framerate : '-'}`,
    },
    {
      label: 'Resolution',
      audio: '-',
      video:
        videoStats?.[0]?.size?.width == null || videoStats?.[0]?.size?.height == null
          ? '-'
          : `${videoStats[0].size.width}x${videoStats[0].size.height}`,
    },
    {
      label: 'Codec',
      audio: audioStats && audioStats[0]?.codec ? audioStats[0]?.codec : '-',
      video: videoStats && videoStats[0]?.codec ? videoStats[0]?.codec : '-',
    },
    {
      label: 'Cur. Layers',
      audio: '-',
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.currentSpatialLayer === null
            ? '-'
            : `S:${videoStats[0]?.currentSpatialLayer || 0} T:${videoStats[0]?.currentTemporalLayer || 0}`
          : '-',
    },
    {
      label: 'Pref. Layers',
      audio: '-',
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.preferredSpatialLayer === null
            ? '-'
            : `S:${videoStats[0]?.preferredSpatialLayer || 0} T:${videoStats[0]?.preferredTemporalLayer || 0}`
          : '-',
    },
  ];

  useEffect(() => {
    if (webcamStream || micStream || screenShareStream) {
      updateStats();
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
      statsIntervalIdRef.current = setInterval(updateStats, 500);
    } else {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    }
    return () => {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    };
  }, [webcamStream, micStream, screenShareStream]);

  const getScoreColor = () => {
    if (score > 7) return '#3BA55D';
    if (score > 4) return '#faa713';
    return '#FF5D5D';
  };

  const getScoreText = () => {
    if (score > 7) return 'Good';
    if (score > 4) return 'Average';
    return 'Poor';
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCoords({
      left: Math.round(rect.x + rect.width / 2),
      top: Math.round(rect.y + window.scrollY),
    });
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          bgcolor: 'rgba(0,0,0,0.4)',
          transition: 'all 200ms linear',
          transform: `scale(${show ? 1 : 0})`,
        }}
      >
        {!micOn && !isPresenting ? (
          <MicOffSmallIcon />
        ) : micOn && isActiveSpeaker ? (
          <SpeakerIcon />
        ) : null}
        <Typography variant="body2" sx={{ color: 'white', ml: 0.5 }}>
          {isPresenting
            ? isLocal
              ? 'You are presenting'
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
              ? 'You'
              : nameTructed(displayName, 26)}
        </Typography>
      </Box>

      {(webcamStream || micStream || screenShareStream) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            onClick={handleClick}
            sx={{
              bgcolor: getScoreColor(),
              p: 0.75,
              '&:hover': { bgcolor: getScoreColor() },
            }}
          >
            <SignalCellularAltIcon sx={{ color: 'white', fontSize: analyzerSize * 0.6 }} />
          </IconButton>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            slotProps={{ paper: { sx: { bgcolor: 'transparent', boxShadow: 'none' } } }}
          >
            <StyledPopoverPaper>
              <Box
                sx={{
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: getScoreColor(),
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Quality Score: {getScoreText()}
                </Typography>
                <IconButton onClick={handleClose} sx={{ color: 'white', p: 0.5 }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Box sx={{ p: 1 }}>
                {qualityStateArray.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      borderBottom:
                        index === qualityStateArray.length - 1
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 100 }}>
                      {index !== 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'white', my: 0.5, ml: 1, display: 'block' }}
                        >
                          {item.label}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        borderLeft: '1px solid rgba(255,255,255,0.2)',
                        py: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        {item.audio}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        borderLeft: '1px solid rgba(255,255,255,0.2)',
                        py: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        {item.video}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </StyledPopoverPaper>
          </Popover>
        </Box>
      )}
    </>
  );
};

export function ParticipantView({ participantId }: { participantId: string }) {
  const { displayName, webcamOn, micOn, isLocal, mode, isActiveSpeaker } =
    useParticipant(participantId);
  const { selectedSpeaker, raisedHandsParticipants } = useMeetingAppContext();

  const isHandRaised = useMemo(() => {
    return raisedHandsParticipants.some((p) => p.participantId === participantId);
  }, [raisedHandsParticipants, participantId]);

  const micRef = useRef<HTMLAudioElement>(null);
  const [mouseOver, setMouseOver] = useState(false);
  //------------------------------------------------
  const isMounted = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);
  //------------------------------------------------

  useEffect(() => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (micRef.current && selectedSpeaker.id && !isFirefox) {
      try {
        (micRef.current as any).setSinkId(selectedSpeaker.id);
      } catch (err) {
        console.log('Setting speaker device failed', err);
      }
    }
  }, [selectedSpeaker]);

  // useEffect(() => {
  //   if (micRef.current) {
  //     if (micOn && micRef.current.srcObject && micRef.current.srcObject instanceof MediaStream) {
  //       const mediaStream = new MediaStream();
  //       mediaStream.addTrack(micRef.current.srcObject.getAudioTracks()[0]);
  //       micRef.current.srcObject = mediaStream;
  //       micRef.current
  //         .play()
  //         .catch((error) => console.error('micRef.current.play() failed', error));
  //     }
  //   }
  // }, [micOn, micRef.current?.srcObject]);
  // في ParticipantView.tsx، قم بتعديل useEffect الخاص بالصوت:

  useEffect(() => {
    // لا تفعل شيئاً إذا كان المستخدم محلياً (لا نحتاج لتشغيل صوته)
    if (isLocal) return;

    if (micRef.current && micOn) {
      // لا تقم بإنشاء MediaStream جديد في كل مرة
      micRef.current.play().catch((error) => {
        if (error?.name === 'AbortError') return;
        console.error('micRef.current.play() failed', error);
      });
    }
  }, [micOn, isLocal]); // إزالة srcObject من الـ dependencies
  // ✅ أضف هذا الـ useEffect الجديد للتنظيف عند إزالة المكون
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // تنظيف مسار الصوت عند إزالة المكون
      if (micRef.current && micRef.current.srcObject) {
        const tracks = (micRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
        micRef.current.srcObject = null;
      }
    };
  }, []);

  if (mode !== 'SEND_AND_RECV') return null;

  return (
    <Box
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      sx={{
        height: '100%',
        width: '100%',
        bgcolor: '#2a2d3a',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        border: isActiveSpeaker ? `2px solid #4CAF50` : isHandRaised ? `2px solid #faa713` : 'none',
        transition: 'border 0.2s ease-in-out'
      }}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />

      {/* Raise Hand Overlay */}
      {isHandRaised && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
            bgcolor: '#faa713',
            borderRadius: '50%',
            width: { xs: 24, md: 32 },
            height: { xs: 24, md: 32 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            animation: 'pulse 2s infinite'
          }}
        >
          <Typography sx={{ fontSize: { xs: '12px', md: '16px' } }}>🖐🏼</Typography>
        </Box>
      )}

      {/* CSS Animation for Pulse */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      {webcamOn ? (
        <VideoPlayer
          participantId={participantId}
          type="video"
          containerStyle={{ height: '100%', width: '100%', overflow: 'hidden' }}
          videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="h-full"
          classNameVideo="h-full"
        />
      ) : (
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#3a3d4a',
              width: { xs: 52, xl: 92 },
              height: { xs: 52, xl: 92 },
              fontSize: { xs: '1.5rem', xl: '2rem' },
            }}
          >
            {String(displayName).charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}
      <CornerDisplayName
        participantId={participantId}
        isPresenting={false}
        displayName={displayName}
        isLocal={isLocal}
        micOn={micOn}
        mouseOver={mouseOver}
        isActiveSpeaker={isActiveSpeaker}
      />
    </Box>
  );
}

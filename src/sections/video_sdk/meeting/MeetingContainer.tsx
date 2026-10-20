import React, { useState, useEffect, useRef, createRef, memo } from 'react';
import { Constants, useMeeting, useParticipant, usePubSub, useWhiteboard } from '@videosdk.live/react-sdk';
import { BottomBar } from './components/BottomBar';
import { SidebarContainer } from '../components/sidebar/SidebarContainer';
import MemorizedParticipantView from './components/ParticipantView';
import { PresenterView } from '../components/PresenterView';
import { nameTructed, trimSnackBarText } from 'src/utils/helper';
import WaitingToJoinScreen from '../components/screens/WaitingToJoinScreen';
import ConfirmBox from '../components/ConfirmBox';
import useIsMobile from 'src/hooks/useIsMobile';
import useIsTab from 'src/hooks/useIsTab';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { ChatMessage, useMeetingAppContext } from '../MeetingAppContextDef';
import { sideBarModes } from 'src/utils/common';
import { Box, Paper } from '@mui/material';

interface ParticipantMicStreamProps {
  participantId: string;
}

interface MeetingError {
  code: number;
  message: string;
}

interface MeetingContainerProps {
  onMeetingLeave: () => void;
  setIsMeetingLeft: (value: boolean) => void;
  meetingId: string;
  token: string;
  participantName: string;
  participantId?: string;
  videoSessionId?: string;
}

interface IncomingChatPayload {
  type?: "text" | "file" | "image";
  text?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
}

interface EntryRequest {
  participantId: string;
  name: string;
  allow: () => void;
  deny: () => void;
  requestedAt: number;
}

const ParticipantMicStream = memo(({ participantId }: ParticipantMicStreamProps) => {
  const { micStream, isLocal } = useParticipant(participantId);

  useEffect(() => {
    if (micStream && !isLocal) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);

      const audio = new Audio();
      audio.srcObject = mediaStream;
      audio.play().catch((err) => {
        if (err?.name === 'AbortError') return;
        console.log('micStream.play() failed', err);
      });
    }
  }, [micStream, isLocal]);

  return null;
});

ParticipantMicStream.displayName = 'ParticipantMicStream';

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
  meetingId,
  token,
  participantName,
  participantId,
  videoSessionId,
}: MeetingContainerProps) {
  const playAudioSafely = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch((err) => {
      if (err?.name === 'AbortError') return;
      console.log('notification audio play failed', err);
    });
  };

  const {
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    useRaisedHandParticipants,
    sideBarMode,
    setSideBarMode,
    whiteboardOpen,
    whiteboardUrl,
    setWhiteboardOpen,
    setWhiteboardUrl,
    setUnreadChatCount,
    setChatMessages
  } = useMeetingAppContext();

  const [participantsData, setParticipantsData] = useState<string[]>([]);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState<boolean | null>(
    null
  );
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState<MeetingError>({ code: 0, message: '' });
  const [entryRequests, setEntryRequests] = useState<EntryRequest[]>([]);
  const entryActionsInFlightRef = useRef<Record<string, boolean>>({});

  const bottomBarHeight = 60;
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const mMeetingRef = useRef<any>(null);
  const containerRef = createRef<HTMLDivElement>();
  const containerHeightRef = useRef(containerHeight);
  const containerWidthRef = useRef(containerWidth);

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const defaultSideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
      ? 360
      : isTab
        ? 320
        : isMobile
          ? 280
          : 240;

  const sideBarContainerWidth =
    sideBarMode === sideBarModes.WHITEBOARD && containerWidth > 0 && !(isMobile || isTab)
      ? Math.round(containerWidth * 0.3)
      : defaultSideBarContainerWidth;

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  const { participantRaisedHand, participantLoweredHand } = useRaisedHandParticipants();

  const parseChatPayload = (rawMessage: string): IncomingChatPayload | null => {
    try {
      const parsed = JSON.parse(rawMessage) as IncomingChatPayload;
      if (!parsed || typeof parsed !== "object") return null;
      if (parsed.type === "text" || parsed.type === "file" || parsed.type === "image") return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const handleOnRecordingStateChanged = ({ status }: { status: string }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${status === Constants.recordingEvents.RECORDING_STARTED
          ? 'Meeting recording is started'
          : 'Meeting recording is stopped.'
        }`,
        {
          position: 'bottom-left',
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        }
      );
    }
  };

  const onParticipantJoined = (participant: any) => {
    participant && participant.setQuality('high');
    if (participant?.id) {
      setEntryRequests((prev) => prev.filter((item) => item.participantId !== participant.id));
    }
  };

  const onEntryRequested = ({
    participantId: requestedParticipantId,
    name,
    allow,
    deny,
  }: {
    participantId: string;
    name: string;
    allow: () => void;
    deny: () => void;
  }) => {
    const requestedAt = Date.now();
    console.log('[entry-requests] onEntryRequested', {
      participantId: requestedParticipantId,
      name,
      requestedAt,
    });
    playAudioSafely(`https://static.videosdk.live/prebuilt/notification.mp3`);
    setSideBarMode(sideBarModes.PARTICIPANTS);
    toast(`${nameTructed(name || 'Participant', 20)} wants to join. Open Participants to accept or reject.`, {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: true,
      closeButton: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
    setEntryRequests((prev) => {
      // SDK might fire `onEntryRequested` multiple times for the same participant.
      // We only keep the latest `allow/deny` callbacks and DO NOT call `deny()` here.
      // Calling `deny()` for "superseded" requests can reject the guest before the host presses Accept.
      return [
        ...prev.filter((item) => item.participantId !== requestedParticipantId),
        {
          participantId: requestedParticipantId,
          name: name || 'Participant',
          allow,
          deny,
          requestedAt,
        },
      ];
    });
  };

  const handleAllowEntry = (requestedParticipantId: string) => {
    setEntryRequests((prev) => {
      if (entryActionsInFlightRef.current[requestedParticipantId]) return prev;

      const targets = prev.filter((item) => item.participantId === requestedParticipantId);
      const latest = targets.sort(
        (a, b) => (b.requestedAt ?? 0) - (a.requestedAt ?? 0)
      )[0];
      if (latest) {
        console.log('[entry-requests] allow clicked', { participantId: requestedParticipantId });
        entryActionsInFlightRef.current[requestedParticipantId] = true;
        setTimeout(() => {
          entryActionsInFlightRef.current[requestedParticipantId] = false;
        }, 2000);
        try {
          latest.allow();
        } catch (e) {
          console.error('entry allow() failed', e);
        }
      }

      return prev.filter((item) => item.participantId !== requestedParticipantId);
    });
  };

  const handleDenyEntry = (requestedParticipantId: string) => {
    setEntryRequests((prev) => {
      if (entryActionsInFlightRef.current[requestedParticipantId]) return prev;

      const targets = prev.filter((item) => item.participantId === requestedParticipantId);
      const latest = targets.sort(
        (a, b) => (b.requestedAt ?? 0) - (a.requestedAt ?? 0)
      )[0];
      if (latest) {
        console.log('[entry-requests] deny clicked', { participantId: requestedParticipantId });
        entryActionsInFlightRef.current[requestedParticipantId] = true;
        setTimeout(() => {
          entryActionsInFlightRef.current[requestedParticipantId] = false;
        }, 2000);
        try {
          latest.deny();
        } catch (e) {
          console.error('entry deny() failed', e);
        }
      }

      return prev.filter((item) => item.participantId !== requestedParticipantId);
    });
  };

  const handleAllowAllEntries = () => {
    setEntryRequests((prev) => {
      const latestByParticipant = new Map<string, EntryRequest>();
      prev.forEach((item) => {
        const existing = latestByParticipant.get(item.participantId);
        if (!existing) {
          latestByParticipant.set(item.participantId, item);
          return;
        }
        if ((item.requestedAt ?? 0) >= (existing.requestedAt ?? 0)) {
          latestByParticipant.set(item.participantId, item);
        }
      });

      latestByParticipant.forEach((req, participantId) => {
        if (entryActionsInFlightRef.current[participantId]) return;
        entryActionsInFlightRef.current[participantId] = true;
        setTimeout(() => {
          entryActionsInFlightRef.current[participantId] = false;
        }, 2000);
        try {
          req.allow();
        } catch (e) {
          console.error('entry allow() failed', e);
        }
      });

      // Clear immediately; flight map exists only to prevent double click.
      return [];
    });
  };

  const handleDenyAllEntries = () => {
    setEntryRequests((prev) => {
      const latestByParticipant = new Map<string, EntryRequest>();
      prev.forEach((item) => {
        const existing = latestByParticipant.get(item.participantId);
        if (!existing) {
          latestByParticipant.set(item.participantId, item);
          return;
        }
        if ((item.requestedAt ?? 0) >= (existing.requestedAt ?? 0)) {
          latestByParticipant.set(item.participantId, item);
        }
      });

      latestByParticipant.forEach((req, participantId) => {
        if (entryActionsInFlightRef.current[participantId]) return;
        entryActionsInFlightRef.current[participantId] = true;
        setTimeout(() => {
          entryActionsInFlightRef.current[participantId] = false;
        }, 2000);
        try {
          req.deny();
        } catch (e) {
          console.error('entry deny() failed', e);
        }
      });

      return [];
    });
  };

  const onEntryResponded = ({
    participantId,
    decision,
  }: {
    participantId: string;
    decision: string;
  }) => {
    console.log('[entry-requests] onEntryResponded', { participantId, decision });
    // Clear any pending requests for the responded participant, regardless of decision.
    setEntryRequests((prev) => prev.filter((item) => item.participantId !== participantId));

    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (decision === 'allowed') {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          handleMeetingLeft();
        }, 3000);
      }
    }
  };

  const onMeetingJoined = () => {
    console.log('[meeting-debug] onMeetingJoined', {
      meetingId: (mMeetingRef.current as any)?.meetingId,
      localParticipantId: (mMeetingRef.current as any)?.localParticipant?.id,
      localDisplayName: (mMeetingRef.current as any)?.localParticipant?.displayName,
    });
    setLocalParticipantAllowedJoin(true);
  };

  const onMeetingLeft = () => {
    console.log('[meeting-debug] onMeetingLeft', {
      meetingId: (mMeetingRef.current as any)?.meetingId,
      localParticipantId: (mMeetingRef.current as any)?.localParticipant?.id,
      localDisplayName: (mMeetingRef.current as any)?.localParticipant?.displayName,
    });
    setSelectedMic({ id: null, label: null });
    setSelectedWebcam({ id: null, label: null });
    setSelectedSpeaker({ id: null, label: null });
    onMeetingLeave();
  };

  const handleOnError = (data: { code: number; message: string }) => {
    const { code, message } = data;
    console.log('[meeting-debug] meetingErr', {
      code,
      message,
      meetingId: (mMeetingRef.current as any)?.meetingId,
      localParticipantId: (mMeetingRef.current as any)?.localParticipant?.id,
      localDisplayName: (mMeetingRef.current as any)?.localParticipant?.displayName,
    });

    const joiningErrCodes = [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith('500');

    playAudioSafely(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    );

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? 'Unable to join meeting!' : message,
    });
  };

  const mMeeting = useMeeting({
    onParticipantJoined,
    onEntryRequested,
    onEntryResponded,
    onMeetingJoined,
    onMeetingStateChanged: ({ state }: { state: string }) => {
      toast(`Meeting is in ${state} state`, {
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    },
    onMeetingLeft,
    onError: ({ code, message }: { code: string; message: string }) =>
      handleOnError({ code: parseInt(code), message }),
    onRecordingStateChanged: handleOnRecordingStateChanged,
  });

  // أضف useRef لتتبع المشاركين السابقين
  const prevParticipantCountRef = useRef(0);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    let decodedPayload = null;
    try {
      if (token && token.includes('.')) {
        decodedPayload = JSON.parse(atob(token.split('.')[1]));
      }
    } catch (e) { }

    console.log('[meeting-debug] container.mounted', {
      meetingIdProp: meetingId,
      participantName,
      token,
      tokenPayload: decodedPayload ? {
        apikey: decodedPayload.apikey,
        permissions: decodedPayload.permissions,
        version: decodedPayload.version
      } : 'Invalid JWT'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // قم بتعديل useEffect الخاص بـ participants
  useEffect(() => {
    // فقط قم بالتحديث إذا تغير عدد المشاركين
    const currentCount = mMeeting.participants.size;
    if (currentCount !== prevParticipantCountRef.current) {
      prevParticipantCountRef.current = currentCount;
      const participantIds = Array.from(mMeeting.participants.keys());
      const participantsSummary = participantIds.map((id) => {
        const p = (mMeeting.participants.get(id) as any) ?? {};
        return { id, displayName: p.displayName, isLocal: p.isLocal };
      });
      console.log('[meeting-debug] participants.changed', {
        meetingId: (mMeeting as any)?.meetingId,
        localParticipantId: (mMeeting as any)?.localParticipant?.id,
        localDisplayName: (mMeeting as any)?.localParticipant?.displayName,
        count: currentCount,
        participantIds,
        participantsSummary,
      });
      setParticipantsData(participantIds);
    }
  }, [mMeeting.participants.size]); // استخدم .size بدلاً من الـ Map كاملاً
  const isPresenting = !!mMeeting.presenterId;
  const { whiteboardUrl: sdkWhiteboardUrl } = useWhiteboard();

  // Fallback: if SDK exposes the whiteboardUrl on guests, sync it into shared state
  useEffect(() => {
    if (!sdkWhiteboardUrl) return;
    if (whiteboardUrl === sdkWhiteboardUrl) return;
    setWhiteboardUrl(sdkWhiteboardUrl);
    if (!whiteboardOpen) setWhiteboardOpen(true);
  }, [sdkWhiteboardUrl, whiteboardOpen, whiteboardUrl, setWhiteboardOpen, setWhiteboardUrl]);

  // Share whiteboard OPEN/CLOSE state with everyone in the meeting
  usePubSub('WHITEBOARD_STATE', {
    onMessageReceived: (data: { message: string }) => {
      try {
        const parsed = JSON.parse(data.message || '{}') as { open?: boolean; url?: string | null };
        if (typeof parsed.open === 'boolean') setWhiteboardOpen(parsed.open);
        if (typeof parsed.url === 'string' || parsed.url === null) setWhiteboardUrl(parsed.url ?? null);
      } catch {
        /* ignore */
      }
    },
  });

  // useEffect(() => {
  //   const debounceTimeout = setTimeout(() => {
  //     const participantIds = Array.from(mMeeting.participants.keys());
  //     console.log('Debounced participantIds', participantIds);
  //     setParticipantsData(participantIds);
  //     console.log('Setting participants');
  //   }, 500);

  //   return () => clearTimeout(debounceTimeout);
  // }, [mMeeting.participants]);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const joinStartedRef = useRef(false);

  useEffect(() => {
    // MeetingProvider configures the token in its own effect, which runs after this
    // child effect. Joining immediately here sends init-config without a token (401).
    // A timeout runs after that configuration, and only once.
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || joinStartedRef.current) return;
      joinStartedRef.current = true;
      console.log('[meeting-debug] join once', {
        meetingId,
        hasToken: Boolean(token),
      });
      try {
        const result = mMeetingRef.current?.join?.();
        Promise.resolve(result).catch((error: unknown) => {
          console.error('[meeting-debug] join failed', error);
        });
      } catch (error) {
        console.error('[meeting-debug] join failed', error);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [meetingId, token]);

  usePubSub('RAISE_HAND', {
    onMessageReceived: (data: { senderId: string; senderName: string; message: string }) => {
      const localParticipantId = mMeeting?.localParticipant?.id;
      const { senderId, senderName, message } = data;
      const isLocal = senderId === localParticipantId;
      let action: 'raise' | 'lower' = 'raise';

      try {
        const parsed = JSON.parse(message || '{}') as { action?: 'raise' | 'lower' };
        if (parsed.action === 'lower') action = 'lower';
      } catch {
        action = 'raise';
      }

      if (action === 'lower') {
        participantLoweredHand(senderId);
        if (!isLocal) {
          toast(`${nameTructed(senderName, 15)} lowered hand`, {
            position: 'bottom-left',
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          });
        }
        return;
      }

      playAudioSafely(`https://static.videosdk.live/prebuilt/notification.mp3`);

      toast(`${isLocal ? 'You' : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });

      participantRaisedHand(senderId);
    },
  });

  const { messages: pubSubMessages } = usePubSub('CHAT', {
    onMessageReceived: (data: { senderId: string; senderName: string; message: string }) => {
      const localParticipantId = mMeeting?.localParticipant?.id;
      const { senderId, senderName, message } = data;
      const isLocal = senderId === localParticipantId;
      const parsedPayload = parseChatPayload(message);
      const toastMessage =
        parsedPayload?.type === "image"
          ? `${nameTructed(senderName, 15)} sent an image`
          : parsedPayload?.type === "file"
            ? `${nameTructed(senderName, 15)} sent ${parsedPayload.fileName || "a file"}`
            : `${nameTructed(senderName, 15)} says: ${parsedPayload?.text || message}`;

      if (!isLocal) {
        playAudioSafely(`https://static.videosdk.live/prebuilt/notification.mp3`);

        // Only show toast if chat panel is NOT open
        if (sideBarMode !== 'CHAT') {
          setUnreadChatCount((prev) => prev + 1);
          toast(`${trimSnackBarText(toastMessage)}`, {
            position: 'bottom-left',
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          });
        }
      }
    },
  });

  // Sync VideoSDK messages with Global Context
  useEffect(() => {
    if (pubSubMessages) {
      const normalizedMessages = pubSubMessages.map((msg) => {
        const parsedPayload = parseChatPayload(msg.message);
        const nextMessage: ChatMessage = {
          senderId: msg.senderId,
          senderName: msg.senderName,
          message: parsedPayload?.text || msg.message,
          timestamp: msg.timestamp,
          type: parsedPayload?.type || "text",
          url: parsedPayload?.url,
          fileName: parsedPayload?.fileName,
          fileSize: parsedPayload?.fileSize,
        };
        return nextMessage;
      });
      setChatMessages(normalizedMessages);
    }
  }, [pubSubMessages, setChatMessages]);

  const showWaitingScreen =
    !meetingErrorVisible &&
    typeof localParticipantAllowedJoin !== 'boolean' &&
    (mMeeting as { isMeetingJoined?: boolean }).isMeetingJoined !== true;

  return (
    <Box sx={{ height: '100vh' }}>
      <Box
        ref={containerRef}
        sx={{
          height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1c23', overflow: 'hidden',
        }}
      >
        {typeof localParticipantAllowedJoin === 'boolean' ? (
          localParticipantAllowedJoin ? (
            <>
              <Box sx={{ display: 'flex',height: '80%', flex: 1, flexDirection: 'row', bgcolor: '#1a1c23' }}>
                {isPresenting ? (
                  <>
                    <Box
                      sx={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PresenterView height={containerHeight - bottomBarHeight} />
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        p: 1,
                      }}
                    >
                      <MemorizedParticipantView isPresenting={isPresenting} />
                    </Box>

                    {/* <Box
                      sx={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PresenterView height={containerHeight - bottomBarHeight} />
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        p: 1,
                      }}
                    >
                      <MemorizedParticipantView isPresenting={isPresenting} />
                    </Box> */}
                  </>
                ) : whiteboardOpen ? (
                  <>
                    <Box
                      sx={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        p: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          flex: 1,
                          bgcolor: '#2a2d3a',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        {whiteboardUrl ? (
                          <Box
                            sx={{
                              width: '100%',
                              height: containerHeight - bottomBarHeight - 20,
                              bgcolor: 'white',
                            }}
                          >
                            <iframe
                              src={whiteboardUrl}
                              style={{ width: '100%', height: '95%', border: 0, display: 'block' }}
                              allow="clipboard-read; clipboard-write; fullscreen"
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: containerHeight - bottomBarHeight - 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'rgba(255,255,255,0.8)',
                            }}
                          >
                            Starting whiteboard…
                          </Box>
                        )}
                      </Paper>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        p: 1,
                      }}
                    >
                      <MemorizedParticipantView isPresenting={false} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    <MemorizedParticipantView isPresenting={isPresenting} />
                  </Box>
                )}

                <SidebarContainer
                  height={containerHeight - bottomBarHeight}
                  sideBarContainerWidth={sideBarContainerWidth}
                  entryRequests={entryRequests}
                  onAllowEntry={handleAllowEntry}
                  onDenyEntry={handleDenyEntry}
                  onAllowAllEntries={handleAllowAllEntries}
                  onDenyAllEntries={handleDenyAllEntries}
                />
              </Box>

              <BottomBar
                bottomBarHeight={bottomBarHeight}
                setIsMeetingLeft={setIsMeetingLeft}
                videoSessionId={videoSessionId}
              />
            </>
          ) : null
        ) : showWaitingScreen ? (
          <WaitingToJoinScreen />
        ) : null}

        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => setMeetingErrorVisible(false)}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
      </Box>
    </Box>
  );
}

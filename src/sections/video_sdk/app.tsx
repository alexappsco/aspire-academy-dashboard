'use client';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MeetingAppProvider } from './MeetingAppContextDef';
import { MeetingContainer } from './meeting/MeetingContainer';
import { LeaveScreen } from './components/screens/LeaveScreen';
import { JoiningScreen } from './components/screens/JoiningScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

interface AppProps {
  videoSessionId?: string;
}

function App({ videoSessionId: propVideoSessionId }: AppProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryVideoSessionId = searchParams.get('videoSessionId') || searchParams.get('href');
  const rawSearch = typeof window !== 'undefined' ? window.location.search : '';
  const fallbackVideoSessionId =
    !queryVideoSessionId && rawSearch.startsWith('?') && !rawSearch.includes('=')
      ? rawSearch.slice(1)
      : undefined;
  const videoSessionId =
    propVideoSessionId ||
    (params as any)?.videoSessionId ||
    queryVideoSessionId ||
    fallbackVideoSessionId;

  console.log('[App Init] Initializing Meeting App with videoSessionId:', videoSessionId);

  const [token, setToken] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  const [micOn, setMicOn] = useState<boolean>(false);
  const [webcamOn, setWebcamOn] = useState<boolean>(false);
  const [customAudioStream, setCustomAudioStream] = useState<MediaStream | null>(null);
  const [customVideoStream, setCustomVideoStream] = useState<MediaStream | null>(null);
  const [isMeetingStarted, setMeetingStarted] = useState<boolean>(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState<boolean>(false);
  const credentialsRef = useRef({
    token: '',
    meetingId: '',
    participantId: '',
    participantName: '',
  });

  useEffect(() => {
    const isMobile = window.matchMedia('only screen and (max-width: 768px)').matches;
    if (!isMobile) return;
    const handleBeforeUnload = () => 'Are you sure you want to exit?';
    window.onbeforeunload = handleBeforeUnload;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar
        closeButton={false}
        pauseOnHover
        theme="light"
      />
      <MeetingAppProvider>
        {isMeetingStarted ? (
          <MeetingProvider
            config={{
              meetingId: credentialsRef.current.meetingId || meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: credentialsRef.current.participantName || participantName || 'Guest',
              multiStream: true,
              debugMode: false,
              customCameraVideoTrack: customVideoStream ?? undefined,
              customMicrophoneAudioTrack: customAudioStream ?? undefined,
              participantId: credentialsRef.current.participantId || participantId || undefined,
            }}
            token={credentialsRef.current.token || token}
            reinitialiseMeetingOnConfigChange={false}
            joinWithoutUserInteraction={false}
          >
            <MeetingContainer
              videoSessionId={videoSessionId}
              meetingId={credentialsRef.current.meetingId || meetingId}
              token={credentialsRef.current.token || token}
              participantName={credentialsRef.current.participantName || participantName || 'Guest'}
              participantId={credentialsRef.current.participantId || participantId}
              onMeetingLeave={() => {
                credentialsRef.current = {
                  token: '',
                  meetingId: '',
                  participantId: '',
                  participantName: '',
                };
                setToken('');
                setMeetingId('');
                setParticipantName('');
                setWebcamOn(false);
                setMicOn(false);
                setMeetingStarted(false);
              }}
              setIsMeetingLeft={setIsMeetingLeft}
            />
          </MeetingProvider>
        ) : isMeetingLeft ? (
          <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
        ) : (
          <JoiningScreen
            videoSessionId={videoSessionId}
            participantName={participantName}
            participantId={participantId}
            setParticipantName={setParticipantName}
            setParticipantId={setParticipantId}
            setMeetingId={setMeetingId}
            setToken={setToken}
            micOn={micOn}
            setMicOn={setMicOn}
            webcamOn={webcamOn}
            setWebcamOn={setWebcamOn}
            customAudioStream={customAudioStream}
            setCustomAudioStream={setCustomAudioStream}
            customVideoStream={customVideoStream}
            setCustomVideoStream={setCustomVideoStream}
            onClickStartMeeting={(
              explicitToken?: string,
              explicitMeetingId?: string,
              explicitName?: string,
              explicitId?: string
            ) => {
              const activeToken = explicitToken || token;
              const activeMeetingId = explicitMeetingId || meetingId;
              const activeName = explicitName || participantName;
              const activeId = explicitId || participantId;

              console.log('[meeting-debug] startNow click', {
                token: activeToken
                  ? `${activeToken.substring(0, 15)}...${activeToken.substring(activeToken.length - 15)}`
                  : 'NULL',
                meetingId: activeMeetingId,
                participantName: activeName,
                participantId: activeId,
              });

              if (!activeToken || !activeMeetingId) {
                alert('Meeting ID or Token is missing.');
                return;
              }

              if (!activeId || !activeName) {
                alert('User identity not verified. Please wait for profile data.');
                return;
              }

              // Basic JWT validation (VideoSDK tokens are JWTs)
              const isJwt =
                activeToken && activeToken.startsWith('eyJ') && activeToken.split('.').length === 3;

              if (!isJwt) {
                console.error('[meeting-debug] Invalid token format (not a JWT)', { activeToken });
                alert('Received an invalid meeting token from the server. Please contact support.');
                return;
              }

              console.log('[meeting-debug] Validation passed, starting meeting...');
              credentialsRef.current = {
                token: activeToken,
                meetingId: activeMeetingId,
                participantId: activeId,
                participantName: activeName,
              };
              setToken(activeToken);
              setMeetingId(activeMeetingId);
              setParticipantId(activeId);
              setParticipantName(activeName);
              setMeetingStarted(true);
            }}
            startMeeting={isMeetingStarted}
            setIsMeetingLeft={setIsMeetingLeft}
          />
        )}
      </MeetingAppProvider>
    </>
  );
}

export default App;

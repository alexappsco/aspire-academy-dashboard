'use client';

import { MeetingProvider } from '@videosdk.live/react-sdk';
import Box from '@mui/material/Box';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MeetingAppProvider } from './MeetingAppContextDef';
import { MeetingContainer } from './meeting/MeetingContainer';
import './index.css';

export interface EmbeddedMeetingCredentials {
  token: string;
  meetingId: string;
  participantId: string;
  participantName: string;
}

interface EmbeddedMeetingProps extends EmbeddedMeetingCredentials {
  videoSessionId: string;
  onLeft: () => void;
}

export default function EmbeddedMeeting({
  videoSessionId,
  token,
  meetingId,
  participantId,
  participantName,
  onLeft,
}: EmbeddedMeetingProps) {
  return (
    <Box
      className="embedded-meeting"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '& .video-container': {
          position: 'relative !important',
          width: '100% !important',
          height: '100% !important',
          maxHeight: '100% !important',
          overflow: 'hidden !important',
        },
        '& .video-container video': {
          position: 'absolute !important',
          inset: '0 !important',
          width: '100% !important',
          height: '100% !important',
          objectFit: 'cover !important',
        },
      }}
    >
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar
        closeButton={false}
        pauseOnHover
        theme="light"
      />
      <MeetingAppProvider>
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: false,
            webcamEnabled: false,
            name: participantName || 'Instructor',
            multiStream: true,
            debugMode: false,
            participantId: participantId || undefined,
          }}
          token={token}
          reinitialiseMeetingOnConfigChange={false}
          joinWithoutUserInteraction={false}
        >
          <MeetingContainer
            embedded
            videoSessionId={videoSessionId}
            meetingId={meetingId}
            token={token}
            participantName={participantName || 'Instructor'}
            participantId={participantId}
            onMeetingLeave={onLeft}
            setIsMeetingLeft={() => onLeft()}
          />
        </MeetingProvider>
      </MeetingAppProvider>
    </Box>
  );
}

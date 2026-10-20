import { useMeeting, useParticipant, VideoPlayer } from '@videosdk.live/react-sdk';
import { useEffect, useRef } from 'react';
import MicOffSmallIcon from '../icons/MicOffSmallIcon';
import ScreenShareIcon from '../icons/ScreenShareIcon';
import SpeakerIcon from '../icons/SpeakerIcon';
import { nameTructed } from 'src/utils/helper';
import { CornerDisplayName } from './ParticipantView';
import { Box, Typography, Button, Paper } from '@mui/material';

interface PresenterViewProps {
  height: number | string;
}

export function PresenterView({ height }: PresenterViewProps) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const {
    micOn,
    webcamOn,
    isLocal,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
  } = useParticipant(presenterId ?? '');

  const audioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isLocal && audioPlayer.current && screenShareOn && screenShareAudioStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareAudioStream.track);
      audioPlayer.current.srcObject = mediaStream;
      audioPlayer.current.play().catch((err) => {
        if (err?.name === 'AbortError') return;
        if (
          err.message ===
          "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD"
        ) {
          console.error('audio' + err.message);
        }
      });
    } else if (audioPlayer.current) {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
    <Paper
      sx={{
        bgcolor: '#2a2d3a',
        borderRadius: 2,
        m: 1,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: height,
      }}
    >
      <audio autoPlay playsInline ref={audioPlayer} style={{ display: 'none' }} />
      <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
        <VideoPlayer
          participantId={presenterId ?? ''}
          type="share"
          containerStyle={{ height: '100%', width: '100%' }}
          className="h-full"
          classNameVideo="h-full"
          videoStyle={{ filter: isLocal ? 'blur(1rem)' : undefined }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: '#2a2d3a',
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!micOn ? <MicOffSmallIcon /> : micOn && isActiveSpeaker ? <SpeakerIcon /> : null}
          <Typography variant="body2" sx={{ color: 'white' }}>
            {isLocal ? 'You are presenting' : `${nameTructed(displayName, 15)} is presenting`}
          </Typography>
        </Box>

        {isLocal && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: '#2a2d3a',
                p: 4,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <ScreenShareIcon style={{ height: 48, width: 48, color: 'white' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mt: 2 }}>
                You are presenting to everyone
              </Typography>
              <Button
                onClick={() => mMeeting.toggleScreenShare()}
                sx={{
                  mt: 4,
                  bgcolor: '#9c27b0',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#ab47bc' },
                }}
              >
                STOP PRESENTING
              </Button>
            </Box>
            <CornerDisplayName
              participantId={presenterId ?? ''}
              isPresenting={true}
              displayName={displayName}
              isLocal={isLocal}
              micOn={micOn}
              mouseOver={true}
              isActiveSpeaker={isActiveSpeaker}
            />
          </>
        )}
      </Box>
    </Paper>
  );
}
// import { useMeeting, useParticipant, VideoPlayer } from '@videosdk.live/react-sdk';
// import { useEffect, useMemo, useRef } from 'react';
// import MicOffSmallIcon from '../icons/MicOffSmallIcon';
// import ScreenShareIcon from '../icons/ScreenShareIcon';
// import SpeakerIcon from '../icons/SpeakerIcon';
// import { nameTructed } from 'src/utils/helper';
// import { CornerDisplayName } from './ParticipantView';
// import { Box, Typography, Button, Paper } from '@mui/material';

// interface PresenterViewProps {
//   height: number | string;
// }

// export function PresenterView({ height }: PresenterViewProps) {
//   const mMeeting = useMeeting();
//   const presenterId = mMeeting?.presenterId;
//   const {
//     micOn,
//     webcamOn,
//     isLocal,
//     screenShareStream,
//     screenShareAudioStream,
//     screenShareOn,
//     displayName,
//     isActiveSpeaker,
//   } = useParticipant(presenterId ?? '');

//   const audioPlayer = useRef<HTMLAudioElement>(null);
//   const presenterVideoRef = useRef<HTMLVideoElement>(null);

//   const shareMediaStream = useMemo(() => {
//     if (!screenShareOn || !screenShareStream) return null;
//     const mediaStream = new MediaStream();
//     mediaStream.addTrack(screenShareStream.track);
//     return mediaStream;
//   }, [screenShareOn, screenShareStream]);

//   useEffect(() => {
//     if (!isLocal && audioPlayer.current && screenShareOn && screenShareAudioStream) {
//       const mediaStream = new MediaStream();
//       mediaStream.addTrack(screenShareAudioStream.track);
//       audioPlayer.current.srcObject = mediaStream;
//       audioPlayer.current.play().catch((err) => {
//         if (err?.name === 'AbortError') return;
//         if (
//           err.message ===
//           "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD"
//         ) {
//           console.error('audio' + err.message);
//         }
//       });
//     } else if (audioPlayer.current) {
//       audioPlayer.current.srcObject = null;
//     }
//   }, [screenShareAudioStream, screenShareOn, isLocal]);

//   useEffect(() => {
//     const videoEl = presenterVideoRef.current;
//     if (!videoEl) return;

//     videoEl.srcObject = shareMediaStream;
//     if (shareMediaStream) {
//       videoEl.play().catch((err) => {
//         if (err?.name === 'AbortError') return;
//         console.error('presenter share video play failed', err);
//       });
//     }
//   }, [shareMediaStream]);

//   return (
//     <Paper
//       sx={{
//         bgcolor: '#2a2d3a',
//         borderRadius: 2,
//         m: 1,
//         position: 'relative',
//         overflow: 'hidden',
//         width: '100%',
//         height: height,
//       }}
//     >
//       <audio autoPlay playsInline ref={audioPlayer} style={{ display: 'none' }} />
//       <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
//         {shareMediaStream ? (
//           <video
//             ref={presenterVideoRef}
//             autoPlay
//             playsInline
//             muted={isLocal}
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'contain',
//               background: '#111',
//               filter: isLocal ? 'blur(1rem)' : undefined,
//             }}
//           />
//         ) : (
//           <VideoPlayer
//             participantId={presenterId ?? ''}
//             type="share"
//             containerStyle={{ height: '100%', width: '100%' }}
//             className="h-full"
//             classNameVideo="h-full"
//             videoStyle={{ filter: isLocal ? 'blur(1rem)' : undefined }}
//           />
//         )}

//         <Box
//           sx={{
//             position: 'absolute',
//             bottom: 8,
//             left: 8,
//             bgcolor: '#2a2d3a',
//             p: 1,
//             borderRadius: 1,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {!micOn ? <MicOffSmallIcon /> : micOn && isActiveSpeaker ? <SpeakerIcon /> : null}
//           <Typography variant="body2" sx={{ color: 'white' }}>
//             {isLocal ? 'You are presenting' : `${nameTructed(displayName, 15)} is presenting`}
//           </Typography>
//         </Box>

//         {isLocal && (
//           <>
//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 bgcolor: '#2a2d3a',
//                 p: 4,
//                 borderRadius: 3,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 textAlign: 'center',
//               }}
//             >
//               <ScreenShareIcon style={{ height: 48, width: 48, color: 'white' }} />
//               <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mt: 2 }}>
//                 You are presenting to everyone
//               </Typography>
//               <Button
//                 onClick={() => mMeeting.toggleScreenShare()}
//                 sx={{
//                   mt: 4,
//                   bgcolor: '#9c27b0',
//                   color: 'white',
//                   px: 3,
//                   py: 1,
//                   borderRadius: 2,
//                   '&:hover': { bgcolor: '#ab47bc' },
//                 }}
//               >
//                 STOP PRESENTING
//               </Button>
//             </Box>
//             <CornerDisplayName
//               participantId={presenterId ?? ''}
//               isPresenting={true}
//               displayName={displayName}
//               isLocal={isLocal}
//               micOn={micOn}
//               mouseOver={true}
//               isActiveSpeaker={isActiveSpeaker}
//             />
//           </>
//         )}
//       </Box>
//     </Paper>
//   );
// }

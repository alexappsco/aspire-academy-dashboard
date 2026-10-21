import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import React from 'react';
import DropSpeaker from '../icons/DropDown/DropSpeaker';
import TestSpeaker from '../icons/DropDown/TestSpeaker';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { Box, Button, Menu, MenuItem, Typography, Paper, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Device {
  deviceId: string;
  label: string;
  kind?: string;
}

interface DropDownSpeakerProps {
  speakers: Device[];
}

const StyledButton = styled(Button)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '6px',
  padding: '4px 8px',
  width: '100%',
  fontSize: '1rem',
  fontWeight: 'normal',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'black',
    outline: '1px solid #4a4a4a',
  },
}));

const DropDownSpeaker: React.FC<DropDownSpeakerProps> = ({ speakers }) => {
  const { setSelectedSpeaker, selectedSpeaker, isMicrophonePermissionAllowed } =
    useMeetingAppContext();
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSpeakerSelect = (deviceId: string, label: string) => {
    setSelectedSpeaker({ id: deviceId, label });
    handleClose();
  };

  const testSpeakers = () => {
    const selectedSpeakerDeviceId = selectedSpeaker.id;
    if (selectedSpeakerDeviceId) {
      // Use a remote asset to avoid bundler loader requirements for mp3.
      const audio = new Audio('https://static.videosdk.live/prebuilt/notification.mp3');
      try {
        audio
          .setSinkId(selectedSpeakerDeviceId)
          .then(() => {
            audio.play();
            setIsPlaying(true);
            audio.addEventListener('timeupdate', () => {
              const progress = (audio.currentTime / audio.duration) * 100;
              setAudioProgress(progress);
            });
            audio.addEventListener('ended', () => {
              setAudioProgress(0);
              setIsPlaying(false);
            });
          })
          .catch((error) => console.error(error));
        audio.play().catch((error) => {
          console.error('Failed to set sinkId:', error);
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.error('Selected speaker deviceId not found.');
    }
  };

  return (
    <>
      <StyledButton
        onClick={handleClick}
        disabled={!isMicrophonePermissionAllowed}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          color: 'white',
          opacity: !isMicrophonePermissionAllowed ? 0.5 : 1,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DropSpeaker fillColor="white" />
          <Typography
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: 150,
            }}
          >
            {isMicrophonePermissionAllowed ? selectedSpeaker?.label : 'Permission Needed'}
          </Typography>
        </Box>
        <ChevronDownIcon style={{ height: 20, width: 20 }} />
      </StyledButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Paper sx={{ bgcolor: '#3a3a3a', minWidth: 250, p: 1 }}>
          {speakers.map((item, index) =>
            item?.kind === 'audiooutput' ? (
              <MenuItem
                key={`speaker_${index}`}
                onClick={() => handleSpeakerSelect(item.deviceId, item.label)}
                selected={selectedSpeaker?.label === item?.label}
                sx={{ display: 'flex', gap: 1 }}
              >
                {selectedSpeaker?.label === item?.label && (
                  <CheckIcon style={{ height: 20, width: 20 }} />
                )}
                <Typography>{item?.label || `Speaker ${index + 1}`}</Typography>
              </MenuItem>
            ) : null
          )}

          {speakers.length > 0 && (
            <>
              <Box sx={{ borderTop: '1px solid #555', my: 1 }} />
              <MenuItem onClick={testSpeakers} sx={{ gap: 2 }}>
                <TestSpeaker />
                {isPlaying ? (
                  <LinearProgress
                    variant="determinate"
                    value={audioProgress}
                    sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#555' }}
                  />
                ) : (
                  <Typography>Test Speakers</Typography>
                )}
              </MenuItem>
            </>
          )}
        </Paper>
      </Menu>
    </>
  );
};

export default DropDownSpeaker;

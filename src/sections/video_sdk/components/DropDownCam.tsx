import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import React from 'react';
import DropCAM from '../icons/DropDown/DropCAM';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { Box, Button, Menu, MenuItem, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Webcam {
  deviceId: string;
  label: string;
  kind?: string;
}

interface DropDownCamProps {
  webcams: Webcam[];
  changeWebcam: (deviceId: string) => void;
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

const DropDownCam: React.FC<DropDownCamProps> = ({ webcams, changeWebcam }) => {
  const { setSelectedWebcam, selectedWebcam, isCameraPermissionAllowed } = useMeetingAppContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleWebcamSelect = (deviceId: string, label: string) => {
    setSelectedWebcam({ id: deviceId, label });
    changeWebcam(deviceId);
    handleClose();
  };

  return (
    <>
      <StyledButton
        onClick={handleClick}
        disabled={!isCameraPermissionAllowed}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          color: 'white',
          opacity: !isCameraPermissionAllowed ? 0.5 : 1,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DropCAM fillColor="white" />
          <Typography
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: 150,
            }}
          >
            {isCameraPermissionAllowed ? selectedWebcam?.label : 'Permission Needed'}
          </Typography>
        </Box>
        <ChevronDownIcon style={{ height: 20, width: 20 }} />
      </StyledButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Paper sx={{ bgcolor: '#3a3a3a', minWidth: 250, p: 1 }}>
          {webcams.map((item, index) =>
            item?.kind === 'videoinput' ? (
              <MenuItem
                key={`webcams_${index}`}
                onClick={() => handleWebcamSelect(item.deviceId, item.label)}
                selected={selectedWebcam?.label === item?.label}
                sx={{ display: 'flex', gap: 1 }}
              >
                {selectedWebcam?.label === item?.label && (
                  <CheckIcon style={{ height: 20, width: 20 }} />
                )}
                <Typography>{item?.label || `Webcam ${index + 1}`}</Typography>
              </MenuItem>
            ) : null
          )}
        </Paper>
      </Menu>
    </>
  );
};

export default DropDownCam;

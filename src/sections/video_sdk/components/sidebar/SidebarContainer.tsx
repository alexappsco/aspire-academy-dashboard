import { useMeeting } from '@videosdk.live/react-sdk';
import React, { Fragment } from 'react';
import useIsMobile from 'src/hooks/useIsMobile';
import useIsTab from 'src/hooks/useIsTab';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChatPanel } from './ChatPanel';
import { Dialog, DialogContent, IconButton, Box, Typography, Paper } from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import CloseIcon from '@mui/icons-material/Close';
import { ParticipantPanel } from './ParticipantPanel';

interface EntryRequest {
  participantId: string;
  name: string;
}

interface SideBarTabViewProps {
  height: number | string;
  sideBarContainerWidth: number | string;
  panelHeight: number;
  panelHeaderHeight: number;
  panelHeaderPadding: number;
  panelPadding: number;
  handleClose: () => void;
  entryRequests: EntryRequest[];
  onAllowEntry: (participantId: string) => void;
  onDenyEntry: (participantId: string) => void;
  onAllowAllEntries: () => void;
  onDenyAllEntries: () => void;
}

const SideBarTabView: React.FC<SideBarTabViewProps> = ({
  height,
  sideBarContainerWidth,
  panelHeight,
  panelHeaderHeight,
  panelHeaderPadding,
  panelPadding,
  handleClose,
  entryRequests,
  onAllowEntry,
  onDenyEntry,
  onAllowAllEntries,
  onDenyAllEntries,
}) => {
  const { participants } = useMeeting();
  const { sideBarMode } = useMeetingAppContext();

  const getTitle = () => {
    if (!sideBarMode) return '';

    const formattedTitle =
      sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase();

    if (sideBarMode === 'PARTICIPANTS') {
      return `${formattedTitle} (${new Map(participants).size})`;
    }

    return formattedTitle;
  };

  return (
    <Box
      sx={{
        bgcolor: '#1a1c23',
        height,
        width: sideBarContainerWidth,
        pt: panelPadding,
        pl: panelPadding,
        pr: panelPadding,
        pb: panelPadding,
      }}
    >
      <Paper
        sx={{
          bgcolor: '#2a2d3a',
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {sideBarMode && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: panelHeaderPadding,
              height: panelHeaderHeight - 1,
              borderBottom: '1px solid rgba(112, 112, 112, 0.2)',
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
              {getTitle()}
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white', p: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        {sideBarMode === 'PARTICIPANTS' ? (
          <ParticipantPanel
            panelHeight={panelHeight}
            entryRequests={entryRequests}
            onAllowEntry={onAllowEntry}
            onDenyEntry={onDenyEntry}
            onAllowAllEntries={onAllowAllEntries}
            onDenyAllEntries={onDenyAllEntries}
          />
        ) : sideBarMode === 'CHAT' ? (
          <ChatPanel panelHeight={panelHeight-150} />
        ) : null}
      </Paper>
    </Box>
  );
};

export function SidebarContainer({
  height,
  sideBarContainerWidth,
  entryRequests,
  onAllowEntry,
  onDenyEntry,
  onAllowAllEntries,
  onDenyAllEntries,
}: {
  height: number;
  sideBarContainerWidth: number;
  entryRequests: EntryRequest[];
  onAllowEntry: (participantId: string) => void;
  onDenyEntry: (participantId: string) => void;
  onAllowAllEntries: () => void;
  onDenyAllEntries: () => void;
}) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const panelPadding = 8;
  const paddedHeight = height - panelPadding * 3.5;

  const panelHeaderHeight = isMobile ? 40 : isTab ? 44 : isLGDesktop ? 48 : isXLDesktop ? 52 : 0;
  const panelHeaderPadding = isMobile ? 6 : isTab ? 8 : isLGDesktop ? 10 : isXLDesktop ? 3 : 0;

  const handleClose = () => {
    setSideBarMode(null);
  };

  if (!sideBarMode) return null;

  if (isTab || isMobile) {
    return (
      <Dialog open={!!sideBarMode} onClose={handleClose} fullScreen>
        <DialogContent sx={{ bgcolor: '#1a1c23', p: 0 }}>
          <SideBarTabView
            height="100%"
            sideBarContainerWidth="100%"
            panelHeight={height}
            panelHeaderHeight={panelHeaderHeight}
            panelHeaderPadding={panelHeaderPadding}
            panelPadding={panelPadding}
            handleClose={handleClose}
            entryRequests={entryRequests}
            onAllowEntry={onAllowEntry}
            onDenyEntry={onDenyEntry}
            onAllowAllEntries={onAllowAllEntries}
            onDenyAllEntries={onDenyAllEntries}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SideBarTabView
      height={paddedHeight}
      sideBarContainerWidth={sideBarContainerWidth}
      panelHeight={paddedHeight - panelHeaderHeight - panelHeaderPadding}
      panelHeaderHeight={panelHeaderHeight}
      panelHeaderPadding={panelHeaderPadding}
      panelPadding={panelPadding}
      handleClose={handleClose}
      entryRequests={entryRequests}
      onAllowEntry={onAllowEntry}
      onDenyEntry={onDenyEntry}
      onAllowAllEntries={onAllowAllEntries}
      onDenyAllEntries={onDenyAllEntries}
    />
  );
}

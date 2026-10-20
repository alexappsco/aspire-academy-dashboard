import React from 'react';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { ParticipantView } from './ParticipantView';
import { Box, Grid } from '@mui/material';

interface ParticipantGridProps {
  participantIds: string[];
  isPresenting: boolean;
}

const MemoizedParticipant = React.memo(ParticipantView, (prevProps, nextProps) => {
  return prevProps.participantId === nextProps.participantId;
});

function ParticipantGrid({ participantIds, isPresenting }: ParticipantGridProps) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = window.matchMedia('only screen and (max-width: 768px)').matches;

  const uniqueParticipantIds = React.useMemo(() => {
    return [...new Set(participantIds)];
  }, [participantIds]);

  const getPerRow = () => {
    if (isPresenting) {
      return 1; // عند الشير سكرين، اجعل المشاركين تحت بعضهم في عمود واحد
    }
    if (isMobile) {
      if (uniqueParticipantIds.length < 4) return 1;
      if (uniqueParticipantIds.length < 9) return 2;
      return 3;
    } else {
      if (uniqueParticipantIds.length < 5) return 2;
      if (uniqueParticipantIds.length < 7) return 3;
      if (uniqueParticipantIds.length < 9) return 4;
      if (uniqueParticipantIds.length < 10) return 3;
      if (uniqueParticipantIds.length < 11) return 4;
      return 4;
    }
  };

  const perRow = getPerRow();
  const rows = Math.ceil(uniqueParticipantIds.length / perRow);

  const getContainerPadding = () => {
    const length = uniqueParticipantIds.length;
    if (length < 2 && !sideBarMode && !isPresenting) return { md: 8, py: 1 };
    if (length < 3 && !sideBarMode && !isPresenting) return { md: 8, py: 4 };
    if (length < 4 && !sideBarMode && !isPresenting) return { md: 8, py: 2 };
    if (length > 4 && !sideBarMode && !isPresenting) return { md: 7 };
    return { md: 0 };
  };

  const padding = getContainerPadding();

  const getParticipantSize = () => {
    const length = uniqueParticipantIds.length;
    if (isPresenting) {
      if (length === 1) return { width: 'auto', height: 'auto' };
      if (length === 2) return { width: { md: 176, xl: 224 }, height: 'auto' };
      return { width: { md: 176, xl: 192 }, height: 'auto' };
    }
    if (length > 1) {
      // اجعل الصور أصغر قليلاً عندما يكون هناك أكثر من مشارك واحد
      return { width: '80%', height: '80%' };
    }
    return { width: '100%', height: '100%' };
  };

  const getMaxWidth = () => {
    if (uniqueParticipantIds.length === 1) return { md: '100%', xl: '1480px' };
    return { md: '600px', xl: '800px' };
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        m: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        px: padding,
        py: padding.py,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        {Array.from({ length: rows }, (_, i) => (
          <Box
            key={`participant-row-${i}`}
            sx={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: isPresenting && participantIds.length !== 1 ? 'center' : 'center',
            }}
          >
            {uniqueParticipantIds.slice(i * perRow, (i + 1) * perRow).map((participantId) => (
              <Box
                key={`participant_${participantId}`}
                sx={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: getMaxWidth(),
                  overflow: 'clip',
                  p: 0.5,
                  ...getParticipantSize(),
                }}
              >
                <MemoizedParticipant participantId={participantId} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export const MemoizedParticipantGrid = React.memo(ParticipantGrid, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.participantIds) === JSON.stringify(nextProps.participantIds) &&
    prevProps.isPresenting === nextProps.isPresenting
  );
});

import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { nameTructed } from 'src/utils/helper';
import { Box, Paper, Typography, Avatar, Stack, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import MicOnIcon from '../../icons/Bottombar/MicOnIcon';
import MicOffIcon from '../../icons/Bottombar/MicOffIcon';
import WebcamOffIcon from '../../icons/Bottombar/WebcamOffIcon';
import WebcamOnIcon from '../../icons/Bottombar/WebcamOnIcon';
import RaiseHandIcon from '../../icons/Bottombar/RaiseHandIcon';
import { useMeetingAppContext } from '../../MeetingAppContextDef';

interface ParticipantListItemProps {
  participantId: string;
  raisedHand: boolean;
  raisedHandOn?: number;
}

interface RaisedHandParticipant {
  participantId: string;
  raisedHandOn: number;
}

interface EntryRequest {
  participantId: string;
  name: string;
  requestedAt?: number;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: 8,
  marginLeft: 8,
  marginRight: 8,
  padding: 8,
  backgroundColor: '#3a3d4a',
  borderRadius: 8,
  marginBottom: 0,
}));

const formatRaisedHandDuration = (raisedHandOn?: number) => {
  if (!raisedHandOn) return '';
  const diffMs = Date.now() - raisedHandOn;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return 'less than 1 min';
  if (diffMinutes === 1) return '1 min';
  return `${diffMinutes} mins`;
};

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({ participantId, raisedHand, raisedHandOn }) => {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);
  const [durationLabel, setDurationLabel] = useState(() => formatRaisedHandDuration(raisedHandOn));

  useEffect(() => {
    setDurationLabel(formatRaisedHandDuration(raisedHandOn));
    if (!raisedHand || !raisedHandOn) return undefined;

    const interval = setInterval(() => {
      setDurationLabel(formatRaisedHandDuration(raisedHandOn));
    }, 30000);

    return () => clearInterval(interval);
  }, [raisedHand, raisedHandOn]);

  return (
    <StyledPaper>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#757575',
            width: 40,
            height: 40,
            fontSize: '1.25rem',
          }}
        >
          {displayName?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, ml: 1, mr: 0.5 }}>
          <Typography
            sx={{
              color: 'white',
              fontSize: '1rem',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              textOverflow: 'ellipsis',
            }}
          >
            {isLocal ? 'You' : nameTructed(displayName, 15)}
          </Typography>
          {raisedHand && durationLabel ? (
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', mt: 0.25 }}>
              Raised hand {durationLabel}
            </Typography>
          ) : null}
        </Box>
        {raisedHand && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', m: 0.5, p: 0.5 }}
          >
            <RaiseHandIcon />
          </Box>
        )}
        <Box sx={{ m: 0.5, p: 0.5 }}>{micOn ? <MicOnIcon /> : <MicOffIcon />}</Box>
        <Box sx={{ m: 0.5, p: 0.5 }}>{webcamOn ? <WebcamOnIcon /> : <WebcamOffIcon />}</Box>
      </Box>
    </StyledPaper>
  );
};

export function ParticipantPanel({
  panelHeight,
  entryRequests,
  onAllowEntry,
  onDenyEntry,
  onAllowAllEntries,
  onDenyAllEntries,
}: {
  panelHeight: number;
  entryRequests: EntryRequest[];
  onAllowEntry: (participantId: string) => void;
  onDenyEntry: (participantId: string) => void;
  onAllowAllEntries: () => void;
  onDenyAllEntries: () => void;
}) {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;

  const pendingParticipants = React.useMemo(() => {
    const map = new Map<string, EntryRequest>();

    for (const req of entryRequests) {
      const existing = map.get(req.participantId);
      if (!existing) {
        map.set(req.participantId, req);
        continue;
      }
      // Pick the latest entry request data (for name ordering/display).
      const existingAt = existing.requestedAt ?? 0;
      const nextAt = req.requestedAt ?? 0;
      if (nextAt >= existingAt) map.set(req.participantId, req);
    }

    return Array.from(map.values()).sort(
      (a, b) => (b.requestedAt ?? 0) - (a.requestedAt ?? 0)
    );
  }, [entryRequests]);

  const uniqueParticipantIds = useMemo(() => {
    const participantIds = [...participants.keys()];
    const seenNames = new Set<string>();
    const localId = mMeeting.localParticipant?.id;
    const localName = mMeeting.localParticipant?.displayName?.trim().toLowerCase();

    return participantIds.filter((participantId) => {
      const participant = participants.get(participantId) as any;
      const name = participant?.displayName?.trim().toLowerCase();

      if (participantId === localId) {
        return true;
      }

      if (name && localName && name === localName) {
        return false; // تعليق: تجاهل التكرار الذي يمتلك نفس اسم المستخدم المحلي
      }

      if (name && seenNames.has(name)) {
        return false;
      }

      if (name) {
        seenNames.add(name);
      }
      return true;
    });
  }, [participants, mMeeting.localParticipant]);

  const uniqueIds = useMemo(() => {
    const participantIds = [...participants.keys()];
    const seenNames = new Set<string>();
    const localId = mMeeting.localParticipant?.id;
    const localName = mMeeting.localParticipant?.displayName?.trim().toLowerCase();

    return participantIds.filter((participantId) => {
      const participant = participants.get(participantId) as any;
      const name = participant?.displayName?.trim().toLowerCase();

      if (participantId === localId) {
        return true;
      }

      if (name && localName && name === localName) {
        return false; // تعليق: تجاهل التكرار الذي يمتلك نفس اسم المستخدم المحلي
      }

      if (name && seenNames.has(name)) {
        return false;
      }

      if (name) {
        seenNames.add(name);
      }
      return true;
    });
  }, [participants, mMeeting.localParticipant]);

  // Raised-hand behavior block:
  // - raised hand stays visible until the same participant lowers it manually
  // - the icon and elapsed time are rendered beside the participant name
  // You can move this block later if you want the same behavior in another panel.
  const sortedRaisedHandsParticipants = useMemo(() => {
    const raisedHandMap = new Map(
      raisedHandsParticipants.map((item) => [item.participantId, item.raisedHandOn])
    );
    const notRaised = uniqueIds.filter(
      (pID) =>
        raisedHandsParticipants.findIndex(
          ({ participantId: rPID }: RaisedHandParticipant) => rPID === pID
        ) === -1
    );

    const raisedSorted = [...raisedHandsParticipants].sort(
      (a: RaisedHandParticipant, b: RaisedHandParticipant) => {
        if (a.raisedHandOn > b.raisedHandOn) return -1;
        if (a.raisedHandOn < b.raisedHandOn) return 1;
        return 0;
      }
    );

    const combined = [
      ...raisedSorted
        .map(({ participantId: p }: RaisedHandParticipant) => ({
          raisedHand: true,
          participantId: p,
          raisedHandOn: raisedHandMap.get(p),
        }))
        .filter((item) => uniqueParticipantIds.includes(item.participantId)),
      ...notRaised.map((p) => ({ raisedHand: false, participantId: p, raisedHandOn: undefined })),
    ];

    return combined;
  }, [raisedHandsParticipants, uniqueParticipantIds]);

  const part = useMemo(() => sortedRaisedHandsParticipants, [sortedRaisedHandsParticipants]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        bgcolor: '#2a2d3a',
        overflowY: 'auto',
        height: panelHeight,
      }}
    >
      {pendingParticipants.length > 0 && (
        <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', mb: 1 }}>
            Join Requests ({pendingParticipants.length})
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={onAllowAllEntries}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Accept All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={onDenyAllEntries}
              sx={{ color: '#ff8a80', borderColor: 'rgba(255,138,128,0.5)' }}
            >
              Reject All
            </Button>
          </Stack>
          <Stack spacing={1}>
            {pendingParticipants.map((request) => (
              <Paper
                key={request.participantId}
                sx={{
                  p: 1,
                  bgcolor: '#3a3d4a',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                  {nameTructed(request.name || 'Participant', 25)}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" variant="contained" onClick={() => onAllowEntry(request.participantId)}>
                    Accept
                  </Button>
                  <Button size="small" variant="text" color="error" onClick={() => onDenyEntry(request.participantId)}>
                    Reject
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, height: panelHeight - 100 }}>
        {uniqueIds.map((participantId: string, index: number) => {
          const item = part[index];
          if (!item) return null;
          const { raisedHand, participantId: peerId, raisedHandOn } = item;
          return (
            <ParticipantListItem
              key={peerId}
              participantId={peerId}
              raisedHand={raisedHand}
              raisedHandOn={raisedHandOn}
            />
          );
        })}
      </Box>
    </Box>
  );
}

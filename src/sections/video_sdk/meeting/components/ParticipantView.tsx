// import React, { useMemo } from 'react';
// import { useMeeting } from '@videosdk.live/react-sdk';
// import { MemoizedParticipantGrid } from '../../components/ParticipantGrid';
// import { Box } from '@mui/material';

// interface ParticipantsViewerProps {
//   isPresenting: boolean;
// }

// function ParticipantsViewer({ isPresenting }: ParticipantsViewerProps) {
//   const {
//     participants,
//     pinnedParticipants,
//     activeSpeakerId,
//     localParticipant,
//     localScreenShareOn,
//     presenterId,
//   } = useMeeting();

//   const participantIds = useMemo(() => {
//     const localId = localParticipant.id;

//     const pinnedParticipantId = [...pinnedParticipants.keys()].filter((participantId) => {
//       return participantId !== localId;
//     });

//     const regularParticipantIds = [...participants.keys()].filter((participantId) => {
//       return ![...pinnedParticipants.keys()].includes(participantId) && localId !== participantId;
//     });

//     const ids = [localId, ...pinnedParticipantId, ...regularParticipantIds].slice(
//       0,
//       isPresenting ? 6 : 16
//     ); // تغيير: أضف المستخدم المحلي مرة واحدة في الأعلى

//     // تعليق: لا تضف المشارك المحلي مرة ثانية إذا كان هو المتحدث النشط
//     if (activeSpeakerId && activeSpeakerId !== localId) {
//       if (!ids.includes(activeSpeakerId)) {
//         ids[ids.length - 1] = activeSpeakerId;
//       }
//     }
//     return ids;
//   }, [
//     participants,
//     activeSpeakerId,
//     pinnedParticipants,
//     presenterId,
//     localScreenShareOn,
//     localParticipant?.id,
//     isPresenting,
//   ]);

//   return (
//     <Box
//       sx={{
//         width: '100%',
//         height: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <MemoizedParticipantGrid participantIds={participantIds} isPresenting={isPresenting} />
//     </Box>
//   );
// //

// const MemorizedParticipantView = React.memo(
//   ParticipantsViewer,
//   (prevProps: ParticipantsViewerProps, nextProps: ParticipantsViewerProps) => {
//     return prevProps.isPresenting === nextProps.isPresenting;
//   }
// );

// export default MemorizedParticipantView;

import React, { useMemo } from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { MemoizedParticipantGrid } from '../../components/ParticipantGrid';
import { Box } from '@mui/material';

interface ParticipantsViewerProps {
  isPresenting: boolean;
}

function ParticipantsViewer({ isPresenting }: ParticipantsViewerProps) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
    presenterId,
  } = useMeeting();

  const participantIds = useMemo(() => {
    const localId = localParticipant?.id;
    const localName = localParticipant?.displayName?.trim().toLowerCase();
    if (!localId) return [];

    const idsSet = new Set<string>();
    const seenDisplayNames = new Set<string>();

    const addParticipant = (participantId: string) => {
      const participant = participants.get(participantId) as any;
      const name = participant?.displayName?.trim().toLowerCase();

      // تعليق: إذا كان هذا هو نفس اسم المستخدم المحلي، تخطيه للحماية من التكرار
      if (participantId !== localId && name && localName && name === localName) {
        return;
      }

      // تعليق: احتفظ بمشارك واحد فقط للمستخدم المحلي
      if (participant?.isLocal && idsSet.has(localId)) {
        return;
      }

      // تعليق: لا تضف نفس الاسم أكثر من مرة لتجنب حالات التكرار الغريبة
      if (name && name !== localName && seenDisplayNames.has(name)) {
        return;
      }

      idsSet.add(participantId);
      if (name) seenDisplayNames.add(name);
    };

    // إضافة المستخدم المحلي أولاً (مرة واحدة فقط)
    addParticipant(localId);

    // إضافة المشاركين المثبتين (باستثناء المحلي)
    for (const participantId of pinnedParticipants.keys()) {
      if (participantId !== localId) {
        addParticipant(participantId);
      }
    }

    // إضافة باقي المشاركين العاديين
    for (const participantId of participants.keys()) {
      if (!pinnedParticipants.has(participantId) && participantId !== localId) {
        addParticipant(participantId);
      }
    }

    // إضافة المتحدث النشط إذا لم يكن موجوداً بالفعل
    if (activeSpeakerId && activeSpeakerId !== localId && !idsSet.has(activeSpeakerId)) {
      addParticipant(activeSpeakerId);
    }

    let ids = Array.from(idsSet);
    ids = ids.slice(0, isPresenting ? 6 : 16);

    return ids;
  }, [
    participants,
    activeSpeakerId,
    pinnedParticipants,
    presenterId,
    localScreenShareOn,
    localParticipant?.displayName,
    localParticipant?.id,
    isPresenting,
  ]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MemoizedParticipantGrid participantIds={participantIds} isPresenting={isPresenting} />
    </Box>
  );
}

const MemorizedParticipantView = React.memo(
  ParticipantsViewer,
  (prevProps: ParticipantsViewerProps, nextProps: ParticipantsViewerProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  }
);

export default MemorizedParticipantView;

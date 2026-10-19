'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import type {
  AdminSessionRequest,
  AdminSessionRequestParticipant,
} from 'src/types/admin-session-request';

type ParticipantRow = AdminSessionRequestParticipant & {
  id: string;
  studentValue: string;
  emailValue: string;
  countryValue: string;
};

type Props = { request: AdminSessionRequest };

export default function ParticipantsTable({ request }: Props) {
  const t = useTranslations('AdminSessionRequestDetails.participants');
  const rows = useMemo<ParticipantRow[]>(() => {
    const participants = request.participants || [];
    const hasOwner = participants.some((item) => item.studentId === request.studentId);
    const allParticipants = hasOwner
      ? participants
      : [
          {
            studentId: request.studentId,
            name: request.studentName,
            email: request.studentEmail,
            imageUrl: '',
            countryId: '',
            countryName: '',
          },
          ...participants,
        ];

    return allParticipants.map((item) => ({
      ...item,
      id: item.studentId,
      studentValue: item.name || '—',
      emailValue: item.email || '—',
      countryValue: item.countryName || '—',
    }));
  }, [request]);

  const tableHead = [
    { id: 'studentValue', label: t('student'), align: cellAlignment.center },
    { id: 'emailValue', label: t('email'), align: cellAlignment.center },
    { id: 'countryValue', label: t('country'), align: cellAlignment.center },
  ];

  const customRender = {
    studentValue: (row: ParticipantRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.studentValue}</Typography>
        {row.studentId === request.studentId && (
          <Box
            component="span"
            sx={{ px: 0.75, py: 0.25, borderRadius: 1, bgcolor: '#DDF5FA', color: '#087F9C', fontSize: 11, fontWeight: 700 }}
          >
            {t('owner')}
          </Box>
        )}
      </Box>
    ),
    emailValue: (row: ParticipantRow) => (
      <Typography sx={{ fontSize: 13 }}>{row.emailValue}</Typography>
    ),
    countryValue: (row: ParticipantRow) => (
      <Typography sx={{ fontSize: 13 }}>{row.countryValue}</Typography>
    ),
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5, boxShadow: 'none', overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, px: 2.5, pt: 2.5, pb: 1 }}>
        {t('title')}
      </Typography>
      <SharedTable
        data={rows}
        tableHead={tableHead}
        customRender={customRender}
        count={rows.length}
        disablePagination
      />
    </Card>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import type { EngagedStudent } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';

interface Props {
  students: EngagedStudent[];
  totalStudents: number;
}

export default function MostEngagedStudents({ students, totalStudents }: Props) {
  const t = useTranslations('InstructorAnalytics.engaged');

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
          {t('title')}
        </Typography>
        <Typography
          component="span"
          onClick={() => {}}
          sx={{
            color: PRIMARY,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {t('view_all', { count: String(totalStudents) })}
        </Typography>
      </Stack>

      {students.length > 0 ? (
        students.map((student, idx) => (
          <Box
            key={student.id}
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: idx === students.length - 1 ? 'none' : '1px solid #F1F5F9',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: `${student.avatarColor}1A`,
                  color: student.avatarColor,
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {student.initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', mb: 0.25 }}>
                  {student.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.grade}
                </Typography>
              </Box>
              <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  {t('lessons', { count: String(student.lessonsCount) })}
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>
                  {t('total_spent', { amount: student.totalSpent.toLocaleString() })}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        ))
      ) : (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>{t('empty')}</Typography>
        </Box>
      )}
    </Card>
  );
}
'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import type { SessionRequestStudentResult } from 'src/types/private-request';

interface Props {
  primaryStudent?: SessionRequestStudentResult | null;
  participants: SessionRequestStudentResult[];
  isActive?: boolean;
}

export default function ParticipantsCard({
  primaryStudent,
  participants = [],
  isActive = false,
}: Props) {
  const t = useTranslations('PrivateRequests.details.participants_card');

  // Consolidate primary student and group participants, avoiding duplicate primary student
  const combinedStudents = useMemo(() => {
    const list: Array<SessionRequestStudentResult & { isOwner: boolean }> = [];

    if (primaryStudent) {
      list.push({ ...primaryStudent, isOwner: true });
    }

    if (participants && participants.length > 0) {
      participants.forEach((p, idx) => {
        if (primaryStudent?.studentId && p.studentId === primaryStudent.studentId) {
          return;
        }
        list.push({
          ...p,
          name: p.name || `${t('participant_badge')} ${idx + 2}`,
          isOwner: false,
        });
      });
    }

    return list;
  }, [primaryStudent, participants, t]);

  const totalCount = combinedStudents.length;

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Header: Title, Total Students Badge & Subtitle */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#F3E8FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:users-group-rounded-bold" width={22} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16.5, color: '#0F172A' }}>
            {t('title')}
          </Typography>
        </Stack>

        <Chip
          label={t('count_badge', { count: totalCount })}
          size="small"
          sx={{
            bgcolor: '#F3E8FF',
            color: '#9333EA',
            fontWeight: 800,
            fontSize: 12.5,
            height: 26,
            borderRadius: 1.5,
            px: 1,
          }}
        />
      </Stack>

      <Typography sx={{ fontSize: 12.5, color: '#64748B', mb: 2.5 }}>
        {t('subtitle')}
      </Typography>

      {/* Participants Table */}
      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 550,
          }}
        >
          {/* Table Header */}
          <Box component="thead">
            <Box
              component="tr"
              sx={{
                bgcolor: '#F8FAFC',
                '& th': {
                  p: 1.75,
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'start',
                  borderBottom: '1px solid #F1F5F9',
                },
              }}
            >
              <Box component="th" sx={{ minWidth: 220 }}>
                {t('col_student')}
              </Box>
              <Box component="th" sx={{ minWidth: 200 }}>
                {t('col_email')}
              </Box>
              <Box component="th" sx={{ minWidth: 120 }}>
                {t('col_country')}
              </Box>
            </Box>
          </Box>

          {/* Table Body */}
          <Box component="tbody">
            {combinedStudents.map((st, index) => {
              const displayName = st.name || `${t('participant_badge')} ${index + 1}`;
              const isOwner = st.isOwner;
              const hasVisibleEmail = Boolean(st.email && (isActive || isOwner));

              return (
                <Box
                  component="tr"
                  key={st.studentId || `student-${index}`}
                  sx={{
                    borderBottom: '1px solid #F1F5F9',
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': { p: 2, fontSize: 13, textAlign: 'start' },
                  }}
                >
                  {/* 1. Student Name & Role Badge */}
                  <Box component="td">
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={st.imageUrl || undefined}
                        alt={displayName}
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: isOwner ? '#DCFCE7' : '#F1F5F9',
                          color: isOwner ? '#15803D' : '#64748B',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {(displayName[0] || 'S').toUpperCase()}
                      </Avatar>

                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                            {displayName}
                          </Typography>
                          {isOwner ? (
                            <Chip
                              label={t('applicant_badge')}
                              size="small"
                              sx={{
                                bgcolor: '#DCFCE7',
                                color: '#15803D',
                                fontWeight: 700,
                                fontSize: 11,
                                height: 22,
                                borderRadius: 1,
                                px: 0.5,
                              }}
                            />
                          ) : (
                            <Chip
                              label={t('participant_badge')}
                              size="small"
                              sx={{
                                bgcolor: '#F3E8FF',
                                color: '#9333EA',
                                fontWeight: 700,
                                fontSize: 11,
                                height: 22,
                                borderRadius: 1,
                                px: 0.5,
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  {/* 2. Email */}
                  <Box component="td">
                    {hasVisibleEmail ? (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:letter-linear" width={16} sx={{ color: '#64748B' }} />
                        <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                          {st.email}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
                        <Iconify icon="solar:lock-outline" width={16} sx={{ color: '#94A3B8' }} />
                        <Typography sx={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 500 }}>
                          {t('email_hidden')}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* 3. Country */}
                  <Box component="td">
                    <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                      {st.countryName || '—'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import type { InstructorKpiData } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';

interface Props {
  kpis: InstructorKpiData;
}

export default function InstructorKpiCards({ kpis }: Props) {
  const t = useTranslations('InstructorAnalytics.kpis');

  const cards = [
    {
      id: 'students',
      icon: 'solar:square-academic-cap-2-bold',
      iconBg: '#EEF2FF',
      iconColor: '#0052CC',
      title: t('total_students'),
      value: kpis.totalStudents.toLocaleString(),
      badge: `+${kpis.studentsGrowthPercent}%`,
      badgeLabel: t('vs_previous'),
    },
    {
      id: 'active_courses',
      icon: 'solar:book-bookmark-bold',
      iconBg: '#ECFDF5',
      iconColor: PRIMARY,
      title: t('active_courses'),
      value: kpis.activeCourses.toLocaleString(),
      statuses: [
        { label: t('approved', { count: String(kpis.approvedCourses) }), color: '#059669' },
        { label: t('under_review', { count: String(kpis.pendingReviewCourses) }), color: '#B45309' },
      ],
    },
    {
      id: 'completed_lessons',
      icon: 'solar:videocamera-record-bold',
      iconBg: '#F5F3FF',
      iconColor: '#9333EA',
      title: t('completed_lessons'),
      value: kpis.completedLessons.toLocaleString(),
      badge: `+${kpis.lessonsGrowthPercent}%`,
      badgeLabel: t('vs_previous'),
    },
    {
      id: 'net_earnings',
      icon: 'solar:wallet-money-bold',
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      title: t('net_earnings'),
      value: `$${kpis.netEarnings.toLocaleString()}`,
      badge: `+${kpis.earningsGrowthPercent}%`,
      badgeLabel: t('share_percent', { percent: String(kpis.instructorSharePercent) }),
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#6B7280', fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}
              >
                {card.title}
              </Typography>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={card.icon} width={20} />
              </Box>
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#1A1A1A',
                fontSize: { xs: 22, md: 24 },
                letterSpacing: '-0.02em',
                mb: 1.25,
              }}
            >
              {card.value}
            </Typography>

            <Box sx={{ mt: 'auto' }}>
              {'statuses' in card && card.statuses ? (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {card.statuses.map((status) => (
                    <Typography key={status.label} sx={{ fontSize: 11, fontWeight: 700, color: status.color }}>
                      {status.label}
                    </Typography>
                  ))}
                </Stack>
              ) : card.badge ? (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      bgcolor: '#D1FAE5',
                      color: '#047857',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {card.badge}
                  </Box>
                  <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                    {card.badgeLabel}
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';
import type { InstructorKpiStats } from '../types';

interface Props {
  stats: InstructorKpiStats;
}

export default function InstructorKpiCards({ stats }: Props) {
  const t = useTranslations('InstructorHome.kpis');

  const cards = [
    {
      id: 'active_courses',
      title: t('active_courses'),
      value: stats.activeCourses,
      icon: 'solar:square-academic-cap-bold',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      footer: (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#D97706',
            }}
          />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#D97706' }}>
            {t('pending_review', { count: stats.pendingReviewCourses })}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'students',
      title: t('enrolled_students'),
      value: stats.enrolledStudents,
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      footer: (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.75 }}>
          <Iconify icon="solar:chart-2-bold" width={16} sx={{ color: '#059669' }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
            {t('monthly_growth', { count: stats.monthlyStudentsGrowth })}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'monthly_earnings',
      title: t('monthly_earnings'),
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon: 'solar:wallet-2-bold',
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
      footer: (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
          {t('instructor_share', { share: stats.instructorSharePercentage })}
        </Typography>
      ),
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {/* Top row: Title and Icon */}
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                {card.title}
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={card.icon} width={22} />
              </Box>
            </Stack>

            {/* Value */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: '2rem',
                color: '#1C252E',
                mb: 1.5,
                lineHeight: 1.2,
              }}
            >
              {card.value}
            </Typography>

            {/* Bottom Footer Note / Badge */}
            <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
              {card.footer}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

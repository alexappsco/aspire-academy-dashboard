'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import LinearProgress from '@mui/material/LinearProgress';

import type { TeachingEfficiencyData } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';
const BLUE = '#0052CC';

interface Props {
  efficiency: TeachingEfficiencyData;
}

export default function TeachingEfficiencyCard({ efficiency }: Props) {
  const t = useTranslations('InstructorAnalytics.efficiency');
  const tUnits = useTranslations('InstructorAnalytics.efficiency.units');

  const metrics = [
    {
      id: 'duration',
      icon: 'solar:clock-circle-bold',
      iconBg: '#EEF2FF',
      iconColor: BLUE,
      value: (
        <>
          {efficiency.avgLessonDurationMinutes} <Box component="span" sx={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>{tUnits('minutes')}</Box>
        </>
      ),
      label: t('avg_duration'),
      sub: t('default_duration', { minutes: String(60) }),
    },
    {
      id: 'per_student',
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#ECFDF5',
      iconColor: PRIMARY,
      value: efficiency.lessonsPerStudent.toFixed(1),
      label: t('per_student'),
      sub: `+${efficiency.rebookingRate.toFixed(1)} ${t('rebooking')}`,
      subColor: PRIMARY,
    },
    {
      id: 'completion',
      icon: 'solar:check-circle-bold',
      iconBg: '#F0FDF4',
      iconColor: '#16A34A',
      value: (
        <>
          {efficiency.completionRate}
          <Box component="span" sx={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>%</Box>
        </>
      ),
      label: t('completion_rate'),
      sub: t('high_engagement'),
      subColor: '#16A34A',
    },
    {
      id: 'cancellation',
      icon: 'solar:close-square-bold',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      value: (
        <>
          {efficiency.cancellationRate}%
        </>
      ),
      label: t('cancellation_rate'),
      sub: t('below_target', { target: String(efficiency.cancellationTarget) }),
      subColor: '#D97706',
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
          {t('subtitle', { name: efficiency.instructorName })}
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {metrics.map((metric) => (
          <Grid key={metric.id} size={{ xs: 6 }}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: '#F8FAFC',
                border: `1px solid ${CARD_BORDER}`,
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    bgcolor: metric.iconBg,
                    color: metric.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={metric.icon} width={16} />
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 19, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3, mb: 0.25 }}>
                {metric.value}
              </Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: '#6B7280', mb: 0.25 }}>
                {metric.label}
              </Typography>
              {metric.sub && (
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: metric.subColor || '#9CA3AF' }}>
                  {metric.sub}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: '#FDF4FF',
          border: '1px solid #F0ABFC',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Iconify icon="solar:star-bold" width={18} sx={{ color: '#FF9F1C' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
              {t('rating')}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>
            {efficiency.ratingAverage.toFixed(2)} <Box component="span" sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>/ 5.0</Box>
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={(efficiency.ratingAverage / 5) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#E9D5FF',
            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#9333EA' },
          }}
        />
        <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500, mt: 1 }}>
          {t('based_on', { count: String(efficiency.ratingCount) })}
        </Typography>
      </Box>

      <Stack sx={{ mt: 'auto', pt: 2 }}>
        <Box
          sx={{
            alignSelf: 'flex-start',
            px: 1.5,
            py: 0.6,
            borderRadius: 1,
            bgcolor: '#EEF2FF',
            border: `1px solid ${BLUE}33`,
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: BLUE }}>
            {t('instructor_id', { id: efficiency.instructorId })}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
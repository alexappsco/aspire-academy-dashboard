'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';

import type { InstructorFinancials, TeachingEfficiency } from 'src/types/instructor-reports';

const PRIMARY = '#2563EB';
const CARD_BORDER = '#E0E0E0';

interface Props {
  financials?: InstructorFinancials;
  teachingEfficiency?: TeachingEfficiency;
}

export default function FinancialOverview({ financials, teachingEfficiency }: Props) {
  const t = useTranslations('InstructorReports.financial');
  const tEfficiency = useTranslations('InstructorReports.efficiency');

  const hasFinancials = financials !== undefined;
  const hasEfficiency = teachingEfficiency !== undefined;

  const platformShare = hasFinancials ? financials.platformShare ?? 0 : 0;
  const netEarnings = hasFinancials ? financials.netEarnings ?? 0 : 0;
  const totalRevenue = hasFinancials ? financials.totalRevenue ?? 0 : 0;

  const platformPct = totalRevenue > 0 ? Math.min(100, (platformShare / totalRevenue) * 100) : 0;
  const instructorPct = totalRevenue > 0 ? Math.max(0, 100 - platformPct) : 100;

  const rows = [
    { key: 'total_revenue', value: totalRevenue, color: '#1A1A1A' },
    { key: 'platform_share', value: platformShare, color: '#64748B' },
    { key: 'net_earnings', value: netEarnings, color: PRIMARY },
    { key: 'unsplit_revenue', value: hasFinancials ? financials.unsplitRevenue ?? 0 : 0, color: '#FF9F1C' },
  ];

  const efficiencyItems = [
    { key: 'avg_lessons_per_student', value: hasEfficiency ? String(teachingEfficiency.avgLessonsPerStudent ?? 0) : '—', icon: 'solar:play-circle-bold' },
    { key: 'avg_lesson_duration', value: hasEfficiency ? `${teachingEfficiency.avgLessonDurationInMinutes ?? 0} ${tEfficiency('minutes')}` : '—', icon: 'solar:clock-circle-bold' },
    { key: 'dropoff_rate', value: hasEfficiency ? `${teachingEfficiency.dropoffRatePercent ?? 0}%` : '—', icon: 'solar:exit-bold' },
    { key: 'completion_rate', value: hasEfficiency ? `${teachingEfficiency.completionRatePercent ?? 0}%` : '—', icon: 'solar:check-circle-bold' },
    { key: 'rating_average', value: hasEfficiency ? (teachingEfficiency.ratingAverage ?? 0).toFixed(1) : '—', icon: 'solar:star-bold' },
    { key: 'rating_count', value: hasEfficiency ? String(teachingEfficiency.ratingCount ?? 0) : '—', icon: 'solar:chat-dots-bold' },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        height: '100%',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Stack spacing={0.75}>
        {rows.map((row) => (
          <Stack key={row.key} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>{t(row.key)}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: row.color }}>
              ${row.value.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#E2E8F0' }} />
            <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
              {t('platform_pct', { percent: platformPct.toFixed(0) })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontSize: 10.5, color: PRIMARY, fontWeight: 700 }}>
              {t('net_pct', { percent: instructorPct.toFixed(0) })}
            </Typography>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: PRIMARY }} />
          </Stack>
        </Stack>
        <Box
          sx={{
            height: 10,
            borderRadius: '999px',
            bgcolor: '#E2E8F0',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              width: `${platformPct}%`,
              height: '100%',
              bgcolor: '#E2E8F0',
              borderRadius: '999px',
            }}
          />
          <Box
            sx={{
              flex: 1,
              height: '100%',
              bgcolor: PRIMARY,
              borderRadius: '999px',
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2.5,
          pt: 2.5,
          borderTop: `1px solid #F1F5F9`,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 1.5 }}>
          {tEfficiency('title')}
        </Typography>
        <Grid container spacing={1}>
          {efficiencyItems.map((item) => (
            <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#F8F9FA',
                  border: `1px solid ${CARD_BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify icon={item.icon} width={18} sx={{ color: PRIMARY, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                    {item.value}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                    {tEfficiency(item.key)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
}
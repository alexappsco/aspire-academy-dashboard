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
import type { DashboardStatCards } from 'src/types/dashboard';

const PRIMARY = '#00A980';
const CARD_BORDER = '#E0E0E0';

interface Props {
  statCards?: DashboardStatCards;
}

export default function MetricCards({ statCards }: Props) {
  const t = useTranslations('Reports.metrics');

  const hasData = statCards !== undefined;

  const items = [
    {
      id: 'students',
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#E8F0FE',
      iconColor: '#1A73E8',
      title: t('total_students'),
      value: hasData ? statCards.totalStudents.toLocaleString() : '—',
      change: hasData ? `${statCards.studentsGrowthPercent >= 0 ? '+' : ''}${statCards.studentsGrowthPercent}%` : undefined,
      changeLabel: t('vs_previous'),
      isPositive: (statCards?.studentsGrowthPercent ?? 0) >= 0,
    },
    {
      id: 'instructors',
      icon: 'solar:user-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('total_instructors'),
      value: hasData ? statCards.totalInstructors.toLocaleString() : '—',
      change: hasData && statCards.instructorsGrowthPercent != null ? `${statCards.instructorsGrowthPercent >= 0 ? '+' : ''}${statCards.instructorsGrowthPercent}%` : undefined,
      changeLabel: t('vs_previous'),
      isPositive: (statCards?.instructorsGrowthPercent ?? 0) >= 0,
    },
    {
      id: 'courses',
      icon: 'solar:book-bookmark-bold',
      iconBg: '#F3E8FF',
      iconColor: '#9333EA',
      title: t('total_courses'),
      value: hasData ? statCards.totalCourses.toLocaleString() : '—',
      change: hasData && statCards.coursesGrowthPercent != null ? `${statCards.coursesGrowthPercent >= 0 ? '+' : ''}${statCards.coursesGrowthPercent}%` : undefined,
      changeLabel: t('vs_previous'),
      isPositive: (statCards?.coursesGrowthPercent ?? 0) >= 0,
    },
    {
      id: 'published',
      icon: 'solar:check-circle-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('published_courses'),
      value: hasData ? statCards.publishedCourses.toLocaleString() : '—',
      subBadge: hasData ? t('published_of', { total: String(statCards.totalCourses), percent: statCards.totalCourses > 0 ? ((statCards.publishedCourses / statCards.totalCourses) * 100).toFixed(1) : '0' }) : undefined,
      subBadgeBg: '#E6F7F2',
      subBadgeColor: PRIMARY,
    },
    {
      id: 'enrollments',
      icon: 'solar:clipboard-text-bold',
      iconBg: '#FFF4E6',
      iconColor: '#FF9F1C',
      title: t('enrollment_requests'),
      value: hasData ? statCards.pendingCourses.toLocaleString() : '—',
      change: hasData && statCards.pendingCourses > 0 ? `+${statCards.pendingCourses > 10 ? '12.4' : statCards.pendingCourses}%` : undefined,
      changeLabel: t('within_year'),
      isPositive: true,
    },
    {
      id: 'revenue',
      icon: 'solar:wallet-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('accepted_revenue'),
      value: hasData ? statCards.rejectedCourses.toLocaleString() : '—',
      change: hasData ? '+8.7%' : undefined,
      changeLabel: t('within_year'),
      isPositive: true,
    },
  ];

  return (
    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: 'none',
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
                {item.title}
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={20} />
              </Box>
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#1A1A1A',
                fontSize: { xs: 22, md: 24 },
                letterSpacing: '-0.02em',
              }}
            >
              {item.value}
            </Typography>

            <Box sx={{ mt: 1.25 }}>
              {item.subBadge ? (
                <Typography sx={{ color: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                  {item.subBadge}
                </Typography>
              ) : item.change ? (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      bgcolor: item.isPositive ? '#E6F7F2' : '#FEE2E2',
                      color: item.isPositive ? PRIMARY : '#E63946',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {item.change}
                  </Box>
                  <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                    {item.changeLabel}
                  </Typography>
                </Stack>
              ) : (
                <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                  {item.changeLabel}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

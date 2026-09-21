'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import type { InstructorReportsStatCards } from 'src/types/instructor-reports';

const PRIMARY = '#2563EB';
const CARD_BORDER = '#E0E0E0';

interface Props {
  statCards?: InstructorReportsStatCards;
}

function formatGrowth(growth: number | null | undefined): string | undefined {
  if (growth == null) return undefined;
  const formatted = String(Math.abs(growth));
  return `${growth >= 0 ? '+' : '-'}${formatted}%`;
}

export default function InstructorMetricCards({ statCards }: Props) {
  const t = useTranslations('InstructorReports.metrics');
  const hasData = statCards !== undefined;

  const items = [
    {
      id: 'netEarnings',
      icon: 'solar:wallet-2-bold',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: t('net_earnings'),
      value: hasData ? `$${(statCards.netEarnings ?? 0).toLocaleString()}` : '—',
      change: hasData ? formatGrowth(statCards.netEarningsGrowthPercent) : undefined,
    },
    {
      id: 'completedLessons',
      icon: 'solar:play-circle-bold',
      iconBg: '#EFF6FF',
      iconColor: PRIMARY,
      title: t('completed_lessons'),
      value: hasData ? (statCards.completedLessonsCount ?? 0).toLocaleString() : '—',
      change: hasData ? formatGrowth(statCards.completedLessonsGrowthPercent) : undefined,
    },
    {
      id: 'activeCourses',
      icon: 'solar:square-academic-cap-bold',
      iconBg: '#F3E8FF',
      iconColor: '#9333EA',
      title: t('active_courses'),
      value: hasData ? (statCards.activeCoursesCount ?? 0).toLocaleString() : '—',
      subBadge:
        hasData && (statCards.pendingCoursesCount ?? 0) > 0
          ? t('pending_courses', { count: String(statCards.pendingCoursesCount) })
          : undefined,
    },
    {
      id: 'totalStudents',
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#FFF4E6',
      iconColor: '#FF9F1C',
      title: t('total_students'),
      value: hasData ? (statCards.totalStudentsCount ?? 0).toLocaleString() : '—',
      change: hasData ? formatGrowth(statCards.totalStudentsGrowthPercent) : undefined,
    },
  ];

  return (
    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
      {items.map((item) => {
        const isPositive = (item.change?.startsWith('+') ?? true) || item.change === undefined;
        return (
          <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
                  <Typography sx={{ color: '#9333EA', fontSize: 11, fontWeight: 700 }}>
                    {item.subBadge}
                  </Typography>
                ) : item.change ? (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        bgcolor: isPositive ? '#E6F7F2' : '#FEE2E2',
                        color: isPositive ? '#059669' : '#E63946',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.change}
                    </Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                      {t('vs_previous')}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                    {t('no_change')}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
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

interface Props {
  statCards?: DashboardStatCards;
}

export default function KpiStatsGrid({ statCards }: Props) {
  const t = useTranslations('Home.kpi');

  const items = [
    {
      id: 'total_students',
      title: t('total_students'),
      value: statCards ? statCards.totalStudents.toLocaleString() : 'No data from backend',
      change:
        statCards !== undefined
          ? `${statCards.studentsGrowthPercent >= 0 ? '+' : ''}${statCards.studentsGrowthPercent}%`
          : undefined,
      isPositive: (statCards?.studentsGrowthPercent ?? 0) >= 0,
      subtitle: t('vs_last_month'),
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'total_lecturers',
      title: t('total_lecturers'),
      value: statCards ? statCards.totalInstructors.toLocaleString() : 'No data from backend',
      change:
        statCards !== undefined
          ? `${statCards.instructorsGrowthPercent >= 0 ? '+' : ''}${statCards.instructorsGrowthPercent}%`
          : undefined,
      isPositive: (statCards?.instructorsGrowthPercent ?? 0) >= 0,
      subtitle: t('vs_last_month'),
      icon: 'solar:user-bold',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      id: 'total_courses',
      title: t('total_courses'),
      value: statCards ? statCards.totalCourses.toLocaleString() : 'No data from backend',
      change:
        statCards !== undefined
          ? `${statCards.coursesGrowthPercent >= 0 ? '+' : ''}${statCards.coursesGrowthPercent}%`
          : undefined,
      isPositive: (statCards?.coursesGrowthPercent ?? 0) >= 0,
      subtitle: t('vs_last_month'),
      icon: 'solar:square-academic-cap-2-bold',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      id: 'published_courses',
      title: t('published_courses'),
      value: statCards ? statCards.publishedCourses.toLocaleString() : 'No data from backend',
      subBadge: t('active_now_for_students'),
      subBadgeBg: '#ECFDF5',
      subBadgeColor: '#059669',
      icon: 'solar:book-bookmark-bold',
      iconBg: '#F0FDF4',
      iconColor: '#16A34A',
    },
    {
      id: 'under_review',
      title: t('under_review_courses'),
      value: statCards ? statCards.pendingCourses.toLocaleString() : 'No data from backend',
      badge: statCards ? t('needs_audit') : undefined,
      badgeColor: '#DC2626',
      valueColor: '#DC2626',
      subBadge: t('action_required'),
      subBadgeBg: '#991B1B',
      subBadgeColor: '#FFFFFF',
      icon: 'solar:alarm-bold',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
    {
      id: 'rejected_courses',
      title: 'الدورات المرفوضة',
      value: statCards ? statCards.rejectedCourses.toLocaleString() : 'No data from backend',
      badge: statCards && statCards.rejectedCourses > 0 ? 'مرفوضة' : undefined,
      badgeColor: '#DC2626',
      valueColor: statCards && statCards.rejectedCourses > 0 ? '#DC2626' : '#0F172A',
      subtitle: t('vs_last_month'),
      icon: 'solar:close-circle-bold',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              ...(item.id === 'under_review' && {
                borderTop: '4px solid #BA1A1A',
              }),
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
              },
            }}
          >
            {/* Header with Title and Icon */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </Typography>

              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
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

            {/* Value & Badge */}
            <Box sx={{ my: 0.5 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: item.valueColor || '#0F172A',
                    fontSize: item.value === 'No data from backend' ? 14 : { xs: 24, md: 28 },
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.value}
                </Typography>

                {item.badge && (
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: item.badgeColor || '#DC2626',
                    }}
                  >
                    {item.badge}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Footer Subtitle / Change */}
            <Box sx={{ mt: 1 }}>
              {item.subBadge && statCards ? (
                <Chip
                  label={item.subBadge}
                  size="small"
                  sx={{
                    bgcolor: item.subBadgeBg || '#991B1B',
                    color: item.subBadgeColor || '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 11,
                    height: 22,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
                  {item.change && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: 'center',
                        color: item.isPositive ? '#10B981' : '#EF4444',
                        fontWeight: 700,
                        fontSize: 12,
                        gap: 0.25,
                      }}
                    >
                      <Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>
                        {item.change}
                      </Typography>
                      <Iconify
                        icon={item.isPositive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                        width={14}
                      />
                    </Stack>
                  )}

                  {item.subtitle && statCards && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                    >
                      {item.subtitle}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

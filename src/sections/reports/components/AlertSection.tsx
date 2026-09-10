'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import type { DashboardPendingTasks } from 'src/types/dashboard';

const PRIMARY = '#00A980';
const ORANGE = '#FF9F1C';
const RED = '#E63946';
const CARD_BORDER = '#E0E0E0';

interface Props {
  pendingTasks?: DashboardPendingTasks;
}

export default function AlertSection({ pendingTasks }: Props) {
  const t = useTranslations('Reports.attention');
  const router = useRouter();
  const hasData = pendingTasks !== undefined;

  const alerts = [
    {
      id: 'courses_pending',
      count: hasData ? pendingTasks.coursesPendingReview : 0,
      title: t('courses_pending.title'),
      description: t('courses_pending.description'),
      action: t('courses_pending.action'),
      accentColor: ORANGE,
      btnBg: ORANGE,
      btnColor: '#FFFFFF',
    },
    {
      id: 'enrollments_pending',
      count: hasData ? pendingTasks.newInstructorsPendingVerification : 0,
      title: t('enrollments_pending.title'),
      description: t('enrollments_pending.description'),
      action: t('enrollments_pending.action'),
      accentColor: PRIMARY,
      btnBg: PRIMARY,
      btnColor: '#FFFFFF',
    },
    {
      id: 'rejected_courses',
      count: hasData ? pendingTasks.rejectedCourses : 0,
      title: t('rejected_courses.title'),
      description: t('rejected_courses.description'),
      action: t('rejected_courses.action'),
      accentColor: RED,
      btnBg: '#F3F4F6',
      btnColor: '#475569',
      btnBorder: 'transparent',
    },
  ];

  const totalPending = hasData
    ? pendingTasks.coursesPendingReview + pendingTasks.newInstructorsPendingVerification + pendingTasks.rejectedCourses
    : 0;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFDF5',
        border: `1px solid #FFE0B2`,
        boxShadow: 'none',
        mb: 2.5,
      }}
    >
      {/* Header Badge */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ORANGE, ml: 1 }} />
          تحتاج إلى انتباهك
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: '#FFF8E1',
            border: `1px solid ${ORANGE}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Typography sx={{ color: '#E65100', fontSize: 12, fontWeight: 700 }}>
            {t('pending_tasks', { count: String(totalPending) })}
          </Typography>
        </Box>
      </Stack>

      {/* Alert Cards */}
      <Grid container spacing={1.5}>
        {alerts.map((alert) => (
          <Grid key={alert.id} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 2.25,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: `1px solid ${CARD_BORDER}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: '#1A1A1A', fontSize: 14, mb: 0.5 }}
                  >
                    {alert.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#6B7280', fontSize: 12, lineHeight: 1.5, mb: 2, maxWidth: '90%' }}
                  >
                    {alert.description}
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: alert.accentColor, fontSize: 24, lineHeight: 1 }}
                >
                  {alert.count}
                </Typography>
              </Box>

              <Button
                fullWidth
                onClick={() => router.push('/courses')}
                sx={{
                  bgcolor: alert.btnBg,
                  color: alert.btnColor,
                  border: alert.btnBorder && alert.btnBorder !== 'transparent' ? `1px solid ${alert.btnBorder}` : 'none',
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: 14,
                  py: 1,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    opacity: 0.9,
                    boxShadow: 'none',
                    bgcolor: alert.btnBg,
                  },
                }}
              >
                {alert.action}
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

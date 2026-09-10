'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const PRIMARY = '#00A980';
const ORANGE = '#FF9F1C';
const RED = '#E63946';
const CARD_BORDER = '#E0E0E0';

export default function AlertSection() {
  const t = useTranslations('Reports.attention');

  const alerts = [
    {
      id: 'courses_pending',
      count: t('courses_pending.count'),
      title: t('courses_pending.title'),
      description: t('courses_pending.description'),
      action: t('courses_pending.action'),
      accentColor: ORANGE,
      btnBg: ORANGE,
      btnColor: '#FFFFFF',
    },
    {
      id: 'enrollments_pending',
      count: t('enrollments_pending.count'),
      title: t('enrollments_pending.title'),
      description: t('enrollments_pending.description'),
      action: t('enrollments_pending.action'),
      accentColor: PRIMARY,
      btnBg: PRIMARY,
      btnColor: '#FFFFFF',
    },
    {
      id: 'rejected_courses',
      count: t('rejected_courses.count'),
      title: t('rejected_courses.title'),
      description: t('rejected_courses.description'),
      action: t('rejected_courses.action'),
      accentColor: RED,
      btnBg: '#FFFFFF',
      btnColor: '#475569',
      btnBorder: CARD_BORDER,
    },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mb: 2.5,
      }}
    >
      {/* Header Badge */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
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
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: ORANGE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            !
          </Box>
          <Typography sx={{ color: '#E65100', fontSize: 12, fontWeight: 700 }}>
            {t('badge')}
          </Typography>
        </Box>
        <Typography sx={{ color: '#6B7280', fontSize: 12, fontWeight: 500 }}>
          {t('pending_tasks', { count: '3' })}
        </Typography>
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
                borderRight: `4px solid ${alert.accentColor}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: alert.accentColor, fontSize: 28, mb: 0.5 }}
                >
                  {alert.count}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 13, mb: 0.75 }}
                >
                  {alert.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#6B7280', fontSize: 11.5, lineHeight: 1.5, mb: 2 }}
                >
                  {alert.description}
                </Typography>
              </Box>

              <Button
                fullWidth
                sx={{
                  bgcolor: alert.btnBg,
                  color: alert.btnColor,
                  border: alert.btnBorder ? `1px solid ${alert.btnBorder}` : 'none',
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: 12,
                  py: 0.85,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    opacity: 0.9,
                    boxShadow: 'none',
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

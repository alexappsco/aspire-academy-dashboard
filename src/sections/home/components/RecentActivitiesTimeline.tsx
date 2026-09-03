'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { MOCK_RECENT_ACTIVITIES } from '../_mock';

export default function RecentActivitiesTimeline() {
  const t = useTranslations('Home.recent_activities');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const activities = MOCK_RECENT_ACTIVITIES;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Right in RTL: Icon & Title */}
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:history-bold" width={18} />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
            >
              {t('title')}
            </Typography>
          </Stack>

          {/* Left in RTL: Subtitle */}
          <Typography
            variant="caption"
            sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600 }}
          >
            {t('subtitle')}
          </Typography>
        </Stack>
      </Box>

      {/* Activity Timeline Items */}
      <Stack spacing={2.25}>
        {activities.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            spacing={1.75}
            sx={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            {/* Right in RTL: Icon + Text */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start', flex: 1, gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: -0.25,
                }}
              >
                <Iconify icon={item.icon} width={18} />
              </Box>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1E293B',
                  lineHeight: 1.5,
                  textAlign: 'start',
                }}
              >
                {isRtl ? item.titleAr : item.titleEn}
              </Typography>
            </Stack>

            {/* Left in RTL: Time */}
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                fontSize: 11.5,
                fontWeight: 600,
                minWidth: 75,
                textAlign: 'end',
                mt: 0.25,
                flexShrink: 0,
              }}
            >
              {isRtl ? item.timeAr : item.timeEn}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

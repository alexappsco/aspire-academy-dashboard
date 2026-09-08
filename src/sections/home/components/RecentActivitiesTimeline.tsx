'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

export default function RecentActivitiesTimeline() {
  const t = useTranslations('Home.recent_activities');

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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

      {/* No Data From Backend Placeholder */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
          bgcolor: '#F8FAFC',
          borderRadius: 2,
          border: '1px dashed #E2E8F0',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            color: '#94A3B8',
          }}
        >
          <Iconify icon="solar:inbox-line-bold" width={24} />
        </Box>
        <Typography sx={{ color: '#475569', fontSize: 14, fontWeight: 700, mb: 0.5 }}>
          No data from backend
        </Typography>
        <Typography sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>
          لا توجد بيانات متاحة لهذا القسم من الخادم حالياً
        </Typography>
      </Box>
    </Card>
  );
}

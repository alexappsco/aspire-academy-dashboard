'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useToast } from 'src/components/toast';
import Iconify from 'src/components/iconify';
import { ServiceSettings } from 'src/types/private-request';

interface Props {
  settings: ServiceSettings;
  onSettingsChange: (newSettings: ServiceSettings) => void;
}

export default function ServiceToggleCards({ settings, onSettingsChange }: Props) {
  const toast = useToast();

  const handleToggleRecorded = () => {
    const next = !settings.recorded.isActive;
    onSettingsChange({
      ...settings,
      recorded: { ...settings.recorded, isActive: next },
    });
    toast.success(
      next
        ? 'تم تفعيل استقبال طلبات المحتوى المسجل'
        : 'تم إيقاف استقبال طلبات المحتوى المسجل مؤقتاً'
    );
  };

  const handleToggleLive = () => {
    const next = !settings.live.isActive;
    onSettingsChange({
      ...settings,
      live: {
        ...settings.live,
        isActive: next,
        statusLabel: next ? 'متاح ومفعل' : 'مؤقت (Off-Air)',
      },
    });
    toast.success(
      next
        ? 'تم تفعيل استقبال طلبات الجلسات المباشرة'
        : 'تم إيقاف استقبال طلبات الجلسات المباشرة مؤقتاً'
    );
  };

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {/* 1. المحتوى المسجل - Private Recorded (Right card in RTL) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header Row: Icon & Info on RIGHT (First in RTL), Switch on LEFT (Second in RTL) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              gap: 1.5,
            }}
          >
            {/* Right side: Icon + Title & Subtitle */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 46 },
                  height: { xs: 40, sm: 46 },
                  borderRadius: 2.5,
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:videocamera-record-bold" width={24} />
              </Box>

              <Box sx={{ textAlign: 'start' }}>
                <Typography
                  sx={{
                    fontSize: { xs: 14.5, sm: 16.5 },
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.3,
                  }}
                >
                  المحتوى المسجل – Private Recorded
                </Typography>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#64748B', mt: 0.25 }}>
                  محاضرات مجزأة / تفريغات وشروحات خاصة
                </Typography>
              </Box>
            </Stack>

            {/* Left side: Switch */}
            <Switch
              checked={settings.recorded.isActive}
              onChange={handleToggleRecorded}
              sx={{
                flexShrink: 0,
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#10B981',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#10B981',
                  },
                },
              }}
            />
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              p: 1.25,
              px: 1.75,
              borderRadius: 2,
              bgcolor: settings.recorded.isActive ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${settings.recorded.isActive ? '#DCFCE7' : '#E2E8F0'}`,
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            {/* Right in RTL (First child): Dot + Status text */}
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: settings.recorded.isActive ? '#10B981' : '#94A3B8',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: settings.recorded.isActive ? '#059669' : '#64748B',
                }}
              >
                {settings.recorded.isActive
                  ? 'متاح ومفعل لاستقبال طلبات جديدة'
                  : 'غير متاح حالياً لاستقبال طلبات جديدة'}
              </Typography>
            </Stack>

            {/* Left in RTL (Second child): Estimated time */}
            <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
              زمن الاستجابة التقديري: {settings.recorded.estimatedResponseTime}
            </Typography>
          </Box>

          {/* Bottom Counter (Right aligned) */}
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
              الطلبات المسجلة النشطة
            </Typography>
            <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
              {settings.recorded.activeRequestsCount} طلبات قيد الإنجاز
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* 2. الجلسات المباشرة - Private Live (Left card in RTL) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header Row: Icon & Info on RIGHT (First in RTL), Switch on LEFT (Second in RTL) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              gap: 1.5,
            }}
          >
            {/* Right side: Icon + Title & Subtitle */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 46 },
                  height: { xs: 40, sm: 46 },
                  borderRadius: 2.5,
                  bgcolor: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:users-group-rounded-bold" width={24} />
              </Box>

              <Box sx={{ textAlign: 'start' }}>
                <Typography
                  sx={{
                    fontSize: { xs: 14.5, sm: 16.5 },
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.3,
                  }}
                >
                  الجلسات المباشرة – Private Live
                </Typography>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#64748B', mt: 0.25 }}>
                  بث 1-على-1 تفاعلي / مناقشات حالات إكلينيكية
                </Typography>
              </Box>
            </Stack>

            {/* Left side: Switch */}
            <Switch
              checked={settings.live.isActive}
              onChange={handleToggleLive}
              sx={{
                flexShrink: 0,
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#10B981',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#10B981',
                  },
                },
              }}
            />
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              p: 1.25,
              px: 1.75,
              borderRadius: 2,
              bgcolor: settings.live.isActive ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${settings.live.isActive ? '#DCFCE7' : '#FEE2E2'}`,
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            {/* Right in RTL (First child): Dot + Status text */}
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: settings.live.isActive ? '#10B981' : '#EF4444',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: settings.live.isActive ? '#059669' : '#DC2626',
                }}
              >
                {settings.live.isActive
                  ? 'متاح ومفعل لاستقبال جلسات حية جديدة'
                  : 'غير متاح حالياً لاستقبال جلسات حية جديدة'}
              </Typography>
            </Stack>

            {/* Left in RTL (Second child): Status label */}
            <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
              الوضع: {settings.live.statusLabel}
            </Typography>
          </Box>

          {/* Bottom Counter (Right aligned) */}
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
              الجلسات المتبقية قيد التنفيذ
            </Typography>
            <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
              {String(settings.live.remainingSessionsCount).padStart(2, '0')} جلسة نشطة
              {settings.live.activeSessionId ? ` (#${settings.live.activeSessionId})` : ''}
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

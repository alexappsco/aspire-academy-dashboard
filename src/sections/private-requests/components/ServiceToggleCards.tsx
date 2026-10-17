'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { InstructorSessionSettingsDto } from 'src/types/private-request';

interface Props {
  settings: InstructorSessionSettingsDto | null;
  loading?: boolean;
  onToggleRecorded: () => void;
  onToggleLive: () => void;
  isUpdatingRecorded?: boolean;
  isUpdatingLive?: boolean;
}

export default function ServiceToggleCards({
  settings,
  loading = false,
  onToggleRecorded,
  onToggleLive,
  isUpdatingRecorded = false,
  isUpdatingLive = false,
}: Props) {
  const t = useTranslations('PrivateRequests.service_toggle');
  const isRecordedActive = Boolean(settings?.acceptsRecordedSessions);
  const isLiveActive = Boolean(settings?.acceptsLiveSessions);

  const recordedCount = settings?.recordedSessionsCount ?? 0;
  const liveCount = settings?.liveSessionsCount ?? 0;

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
                  {t('recorded_title')}
                </Typography>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#64748B', mt: 0.25 }}>
                  {t('recorded_subtitle')}
                </Typography>
              </Box>
            </Stack>

            {/* Left side: Switch with loader */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {isUpdatingRecorded && (
                <CircularProgress size={18} sx={{ color: '#10B981' }} />
              )}
              <Switch
                checked={isRecordedActive}
                disabled={loading || isUpdatingRecorded}
                onChange={onToggleRecorded}
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
            </Stack>
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              p: 1.25,
              px: 1.75,
              borderRadius: 2,
              bgcolor: isRecordedActive ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${isRecordedActive ? '#DCFCE7' : '#E2E8F0'}`,
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
              {loading ? (
                <Skeleton width={180} height={20} />
              ) : (
                <>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: isRecordedActive ? '#10B981' : '#94A3B8',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isRecordedActive ? '#059669' : '#64748B',
                    }}
                  >
                    {isRecordedActive
                      ? t('recorded_active')
                      : t('recorded_inactive')}
                  </Typography>
                </>
              )}
            </Stack>

            {/* Left in RTL (Second child): Estimated time */}
            <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
              {t('response_time')}
            </Typography>
          </Box>

          {/* Bottom Counter (Right aligned) */}
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
              {t('active_recorded_requests')}
            </Typography>
            {loading ? (
              <Skeleton width={120} height={28} sx={{ mt: 0.25 }} />
            ) : (
              <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
                {t('requests_in_progress', { count: recordedCount })}
              </Typography>
            )}
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
                  {t('live_title')}
                </Typography>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#64748B', mt: 0.25 }}>
                  {t('live_subtitle')}
                </Typography>
              </Box>
            </Stack>

            {/* Left side: Switch with loader */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {isUpdatingLive && (
                <CircularProgress size={18} sx={{ color: '#10B981' }} />
              )}
              <Switch
                checked={isLiveActive}
                disabled={loading || isUpdatingLive}
                onChange={onToggleLive}
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
            </Stack>
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              p: 1.25,
              px: 1.75,
              borderRadius: 2,
              bgcolor: isLiveActive ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${isLiveActive ? '#DCFCE7' : '#FEE2E2'}`,
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
              {loading ? (
                <Skeleton width={180} height={20} />
              ) : (
                <>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: isLiveActive ? '#10B981' : '#EF4444',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isLiveActive ? '#059669' : '#DC2626',
                    }}
                  >
                    {isLiveActive
                      ? t('live_active')
                      : t('live_inactive')}
                  </Typography>
                </>
              )}
            </Stack>

            {/* Left in RTL (Second child): Status label */}
            <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
              {isLiveActive ? t('status_on_air') : t('status_off_air')}
            </Typography>
          </Box>

          {/* Bottom Counter (Right aligned) */}
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
              {t('remaining_live_sessions')}
            </Typography>
            {loading ? (
              <Skeleton width={120} height={28} sx={{ mt: 0.25 }} />
            ) : (
              <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
                {t('active_sessions', { count: String(liveCount).padStart(2, '0') })}
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

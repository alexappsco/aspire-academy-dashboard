'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { getProfile, joinMeeting } from 'src/actions/api';
import EmbeddedMeeting, { EmbeddedMeetingCredentials } from 'src/sections/video_sdk/EmbeddedMeeting';

interface Props {
  requestId: string;
  sessionTitle?: string;
  studentName?: string;
  elapsedMinutes?: number;
  expectedEarnings?: number;
  currency?: string;
}

export default function LiveBroadcastRoomSection({
  requestId,
  sessionTitle = '',
  studentName = 'الطالب',
  elapsedMinutes = 0,
  expectedEarnings = 0,
  currency = '',
}: Props) {
  const toast = useToast();
  const t = useTranslations('PrivateRequests');

  const [activeTab, setActiveTab] = useState<'screen' | 'logs'>('screen');
  const [joining, setJoining] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [credentials, setCredentials] = useState<EmbeddedMeetingCredentials | null>(null);
  const [stageReady, setStageReady] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const stageHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = document.createElement('div');
    host.setAttribute('data-embedded-meeting', 'true');
    stageHostRef.current = host;
    setStageReady(true);
    return () => {
      host.remove();
      stageHostRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = stageHostRef.current;
    if (!host) return;
    if (!credentials) {
      host.remove();
      return;
    }

    host.style.display = 'flex';
    host.style.flexDirection = 'column';
    host.style.overflow = 'hidden';
    host.style.background = '#0F172A';

    if (expanded) {
      host.style.position = 'fixed';
      host.style.top = '0';
      host.style.right = '0';
      host.style.bottom = '0';
      host.style.left = '0';
      host.style.width = '100vw';
      host.style.height = '100dvh';
      host.style.zIndex = '1600';
      document.body.appendChild(host);
      return;
    }

    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.right = '0';
    host.style.bottom = '0';
    host.style.left = '0';
    host.style.width = '100%';
    host.style.height = '100%';
    host.style.zIndex = '1';
    frameRef.current?.appendChild(host);
  }, [credentials, expanded, stageReady]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const handleJoin = async () => {
    if (!requestId || joining) return;
    setJoining(true);
    try {
      const profile = await getProfile();
      const result = await joinMeeting({ videoSessionId: requestId });
      if (!result.roomId || !result.token) {
        toast.error(result.message || t('details.live_room.join_failed'));
        return;
      }
      setCredentials({
        token: result.token,
        meetingId: result.roomId,
        participantId: result.participantId || profile.id || '',
        participantName: profile.name || 'Instructor',
      });
    } catch {
      toast.error(t('details.live_room.join_failed'));
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        mb: 3,
      }}
    >
      {/* Top Header Row: Title on RIGHT (First in RTL), Tabs on LEFT (Second in RTL) */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 2.5,
          gap: 1.5,
        }}
      >
        {/* Right in RTL: Title with live red dot & Chip */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: '#EF4444',
              boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, color: '#0F172A' }}>
            {t('details.live_room.title')}
          </Typography>
          <Chip
            label={t('details.live_room.test_broadcast')}
            size="small"
            sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: 11, height: 22 }}
          />
        </Stack>

        {/* Left in RTL: Tabs: شاشة البث / سجل الجلسات */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 2,
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: 13,
            },
            '& .Mui-selected': {
              bgcolor: '#F1F5F9',
              color: '#0F172A !important',
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab value="screen" label={t('details.live_room.tab_screen')} />
          <Tab value="logs" label={t('details.live_room.tab_logs')} />
        </Tabs>
      </Stack>

      {/* Main Live Room Frame. Stays mounted while the meeting is open so expand does not join again. */}
      <Box
        ref={frameRef}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#0F172A',
          position: 'relative',
          width: '100%',
          height: credentials ? { xs: 460, md: 560 } : 'auto',
          minHeight: credentials ? { xs: 460, md: 560 } : { xs: 360, md: 520 },
          display: activeTab === 'screen' ? 'flex' : 'none',
          flexDirection: 'column',
          justifyContent: credentials ? 'stretch' : 'space-between',
          p: credentials ? 0 : 2.5,
          backgroundImage: credentials
            ? 'none'
            : 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
        }}
      >
          {!credentials && (
          <>
          {/* Top Floating Bar inside Live Screen: Connected student */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}
          >
            {/* Right in RTL: Connected Student status */}
            <Chip
              icon={<Iconify icon="solar:user-bold" width={15} sx={{ color: '#FFFFFF !important' }} />}
              label={t('details.live_room.live_now', { student: studentName })}
              size="small"
              sx={{
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: 11, sm: 12 },
                borderRadius: 2,
                px: 1,
                height: 26,
                '& .MuiChip-icon': {
                  margin: '0 !important',
                  marginInlineEnd: '6px !important',
                },
                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />
          </Stack>

          {/* Central Presentation / Board Mockup */}
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 4, md: 6 },
              px: 2,
              zIndex: 1,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                bgcolor: 'rgba(13, 148, 136, 0.2)',
                color: '#2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '1px solid rgba(45, 212, 191, 0.4)',
              }}
            >
              <Iconify icon="solar:stethoscope-bold" width={28} />
            </Box>

            <Typography
              sx={{
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: { xs: 18, md: 24 },
                letterSpacing: -0.5,
                mb: 1,
              }}
            >
              {sessionTitle || t('details.live_room.interactive_live')}
            </Typography>

            <Typography
              sx={{
                color: '#94A3B8',
                fontSize: { xs: 12, md: 14 },
                lineHeight: 1.6,
                maxWidth: 480,
                mx: 'auto',
                mb: 2.5,
              }}
            >
              {t('details.live_room.interactive_live')}
            </Typography>

            <Button
              variant="contained"
              disabled={joining}
              onClick={handleJoin}
              startIcon={<Iconify icon="solar:play-circle-bold" width={20} />}
              sx={{
                borderRadius: 2,
                bgcolor: '#0D9488',
                fontWeight: 800,
                px: 3,
                '&:hover': { bgcolor: '#0F766E' },
                '& .MuiButton-startIcon': {
                  margin: '0 !important',
                  marginInlineEnd: '8px !important',
                },
              }}
            >
              {joining ? t('details.live_room.joining') : t('details.live_room.join_session')}
            </Button>
          </Box>
          </>
          )}

          {credentials && !expanded && (
            <Button
              onClick={() => setExpanded(true)}
              startIcon={<Iconify icon="solar:maximize-square-bold" width={18} />}
              sx={{
                position: 'absolute',
                top: 12,
                insetInlineEnd: 12,
                zIndex: 30,
                borderRadius: 2,
                px: 1.5,
                bgcolor: 'rgba(15, 23, 42, 0.92)',
                color: '#FFFFFF',
                fontWeight: 800,
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: '#0F172A' },
                '& .MuiButton-startIcon': {
                  margin: '0 !important',
                  marginInlineEnd: '8px !important',
                },
              }}
            >
              {t('details.live_room.expand_meeting')}
            </Button>
          )}
          {credentials &&
            stageReady &&
            stageHostRef.current &&
            createPortal(
              <EmbeddedMeeting
                videoSessionId={requestId}
                token={credentials.token}
                meetingId={credentials.meetingId}
                participantId={credentials.participantId}
                participantName={credentials.participantName}
                onLeft={() => {
                  setExpanded(false);
                  setCredentials(null);
                }}
              />,
              stageHostRef.current
            )}
          {expanded &&
            createPortal(
              <Button
                onClick={() => setExpanded(false)}
                startIcon={<Iconify icon="solar:minimize-square-bold" width={18} />}
                sx={{
                  position: 'fixed',
                  top: 16,
                  insetInlineEnd: 16,
                  zIndex: 2000,
                  borderRadius: 2,
                  px: 1.75,
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  '&:hover': { bgcolor: '#1E293B' },
                  '& .MuiButton-startIcon': {
                    margin: '0 !important',
                    marginInlineEnd: '8px !important',
                  },
                }}
              >
                {t('details.live_room.shrink_meeting')}
              </Button>,
              document.body
            )}
        </Box>

      {activeTab === 'logs' && !expanded && (
        /* Logs Tab */
        <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
          <Iconify icon="solar:history-bold" width={40} sx={{ color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            {t('details.live_room.logs_title')}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#94A3B8', mt: 0.5 }}>
            {t('details.live_room.logs_desc')}
          </Typography>
        </Box>
      )}

      {/* Info status alert below live room: Note on RIGHT (First in RTL), Status on LEFT (Second in RTL) */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Right in RTL (First child): Note */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
          <Iconify icon="solar:info-circle-bold" width={18} sx={{ color: '#2563EB' }} />
          <Typography sx={{ fontSize: 12.5, color: '#1E40AF', fontWeight: 600 }}>
            {t('details.live_room.elapsed_note', {
              minutes: elapsedMinutes,
              earnings: expectedEarnings.toFixed(2),
              currency,
            })}
          </Typography>
        </Stack>

        {/* Left in RTL (Second child): Connection status */}
        <Typography sx={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
          {t('details.live_room.ping_status')}
        </Typography>
      </Box>
    </Card>
  );
}

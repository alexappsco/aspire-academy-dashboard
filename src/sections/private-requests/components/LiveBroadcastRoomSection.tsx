'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

interface Props {
  studentName?: string;
  duration?: string;
  elapsedMinutes?: number;
  expectedEarnings?: number;
  onEndLiveSession?: () => void;
}

export default function LiveBroadcastRoomSection({
  studentName = 'محمد أحمد',
  duration = '01:30:00',
  elapsedMinutes = 90,
  expectedEarnings = 10.5,
  onEndLiveSession,
}: Props) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'screen' | 'logs'>('screen');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);

  const handleToggleMic = () => {
    setMicOn(!micOn);
    toast.info(!micOn ? 'تم تشغيل الميكروفون' : 'تم كتم الميكروفون');
  };

  const handleToggleCam = () => {
    setCamOn(!camOn);
    toast.info(!camOn ? 'تم تشغيل الكاميرا' : 'تم إيقاف الكاميرا');
  };

  const handleToggleShare = () => {
    setScreenSharing(!screenSharing);
    toast.info(!screenSharing ? 'بدء مشاركة الشاشة' : 'تم إيقاف مشاركة الشاشة');
  };

  const handleConfirmEndSession = () => {
    setEndDialogOpen(false);
    onEndLiveSession?.();
    toast.success(`تم إنهاء الجلسة بنجاح واعتماد ${expectedEarnings.toFixed(2)} ج.م في حسابك`);
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
            المعاينة الحية لغرفة البث الأكاديمي
          </Typography>
          <Chip
            label="بث تجريبي"
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
          <Tab value="screen" label="شاشة البث" />
          <Tab value="logs" label="سجل الجلسات" />
        </Tabs>
      </Stack>

      {/* Main Live Room Frame */}
      {activeTab === 'screen' ? (
        <Box
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#0F172A',
            position: 'relative',
            minHeight: { xs: 360, md: 460 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2.5,
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
          }}
        >
          {/* Top Floating Bar inside Live Screen: Student on RIGHT (First in RTL), Timer on LEFT (Second in RTL) */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}
          >
            {/* Right in RTL: Connected Student status */}
            <Chip
              icon={<Iconify icon="solar:user-bold" width={15} sx={{ color: '#FFFFFF !important' }} />}
              label={`مباشر الآن (${studentName} - طالب متصل)`}
              size="small"
              sx={{
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: 11, sm: 12 },
                borderRadius: 2,
                px: 0.5,
              }}
            />

            {/* Left in RTL: Live Timer */}
            <Chip
              icon={<Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: '#FFFFFF !important' }} />}
              label={`زمن الجلسة: ${duration}`}
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: 11.5, sm: 12.5 },
                borderRadius: 2,
                px: 0.5,
              }}
            />
          </Stack>

          {/* Instructor PIP Overlay (Camera) */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 55, md: 70 },
              left: { xs: 15, md: 20 },
              width: { xs: 95, sm: 120, md: 150 },
              height: { xs: 68, sm: 85, md: 105 },
              borderRadius: 2.5,
              overflow: 'hidden',
              bgcolor: '#1E293B',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {camOn ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  د. خالد (أنت)
                </Box>
              </Box>
            ) : (
              <Avatar sx={{ bgcolor: '#334155' }}>
                <Iconify icon="solar:user-bold" width={24} />
              </Avatar>
            )}
          </Box>

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
              Adrenergic Pharmacology & Receptors
            </Typography>

            <Typography
              sx={{
                color: '#94A3B8',
                fontSize: { xs: 12, md: 14 },
                lineHeight: 1.6,
                maxWidth: 480,
                mx: 'auto',
              }}
            >
              مراجعة الآليات الحيوية للمستقبلات الأدرينرجية ألفا وبيتا ودورها السريري في الحالات الطارئة.
            </Typography>
          </Box>

          {/* Bottom Floating Control Bar */}
          <Box
            sx={{
              p: 1.5,
              px: 2.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              zIndex: 2,
            }}
          >
            {/* Right in RTL (First child): End session button */}
            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="solar:phone-calling-rounded-bold" width={18} sx={{ transform: 'rotate(135deg)' }} />}
              onClick={() => setEndDialogOpen(true)}
              sx={{
                borderRadius: 2,
                bgcolor: '#DC2626',
                fontWeight: 800,
                fontSize: 13,
                px: 2,
                '&:hover': { bgcolor: '#B91C1C' },
              }}
            >
              إنهاء الجلسة الحالية
            </Button>

            {/* Center: Controls (Mic, Cam, Share, Settings) */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleToggleMic}
                sx={{
                  bgcolor: micOn ? 'rgba(255,255,255,0.1)' : '#DC2626',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: micOn ? 'rgba(255,255,255,0.2)' : '#B91C1C' },
                }}
              >
                <Iconify icon={micOn ? 'solar:microphone-2-bold' : 'solar:microphone-2-broken'} width={18} />
              </IconButton>

              <IconButton
                onClick={handleToggleCam}
                sx={{
                  bgcolor: camOn ? 'rgba(255,255,255,0.1)' : '#DC2626',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: camOn ? 'rgba(255,255,255,0.2)' : '#B91C1C' },
                }}
              >
                <Iconify icon={camOn ? 'solar:videocamera-bold' : 'solar:videocamera-record-broken'} width={18} />
              </IconButton>

              <IconButton
                onClick={handleToggleShare}
                sx={{
                  bgcolor: screenSharing ? '#0284C7' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: screenSharing ? '#0369A1' : 'rgba(255,255,255,0.2)' },
                }}
              >
                <Iconify icon="solar:screencast-bold" width={18} />
              </IconButton>

              <IconButton
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <Iconify icon="solar:settings-minimalistic-bold" width={18} />
              </IconButton>
            </Stack>

            {/* Left in RTL (Third child): Audio Waveform status */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ color: '#E2E8F0', fontSize: 12, fontWeight: 700 }}>
                الصوت متصل
              </Typography>
              <Box sx={{ color: '#10B981', display: 'flex' }}>
                <Iconify icon="solar:soundwave-bold" width={22} />
              </Box>
            </Stack>
          </Box>
        </Box>
      ) : (
        /* Logs Tab */
        <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
          <Iconify icon="solar:history-bold" width={40} sx={{ color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            سجل الجلسات السابقة لهذا الطلب
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#94A3B8', mt: 0.5 }}>
            تم تسجيل جلستين سابقتين بنجاح بإجمالي 90 دقيقة.
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
            الجلسة الحالية استغرقت {elapsedMinutes} دقيقة بنجاح. عند الإنهاء سيتم اعتماد {expectedEarnings.toFixed(2)} ج.م بحسابك فوراً.
          </Typography>
        </Stack>

        {/* Left in RTL (Second child): Connection status */}
        <Typography sx={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
          حالة الاتصال: ممتازة (Ping: 24ms)
        </Typography>
      </Box>

      {/* End Live Session Confirmation Dialog */}
      <Dialog
        open={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'center' }}>
          تأكيد إنهاء الجلسة المباشرة
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 13.5, mb: 1.5 }}>
            هل أنت متأكد من رغبتك في إغلاق البث وإنهاء الجلسة الحالية مع الطالب {studentName}؟
          </Typography>
          <Typography sx={{ color: '#047857', fontSize: 13, fontWeight: 700, bgcolor: '#ECFDF5', p: 1.5, borderRadius: 2 }}>
            المدة المسجلة: {elapsedMinutes} دقيقة • المستحق: {expectedEarnings.toFixed(2)} جنيه
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button variant="outlined" onClick={() => setEndDialogOpen(false)} sx={{ borderRadius: 2, px: 3 }}>
            تراجع
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmEndSession}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            تأكيد الإنهاء
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

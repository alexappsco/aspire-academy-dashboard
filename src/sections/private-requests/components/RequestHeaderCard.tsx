'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { PrivateRequestItem, PrivateRequestStatus, PrivateRequestServiceType } from 'src/types/private-request';

interface Props {
  request: PrivateRequestItem;
  onStatusChange?: (newStatus: PrivateRequestStatus) => void;
  onServiceTypeChange?: (newType: PrivateRequestServiceType) => void;
  onFinishService?: () => void;
}

export default function RequestHeaderCard({
  request,
  onStatusChange,
  onServiceTypeChange,
  onFinishService,
}: Props) {
  const toast = useToast();
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const handleConfirmFinish = () => {
    setFinishDialogOpen(false);
    onFinishService?.();
    toast.success('تم إنهاء الخدمة بنجاح وإرسال الإشعار للطالب والإدارة');
  };

  const isRecorded = request.serviceType === 'recorded';
  const isActive = request.status === 'active';
  const isPendingAdmin = request.status === 'pending_admin';
  const isNew = request.status === 'new';

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
      {/* Interactive Mode Switcher for UI Prototype / Review */}
      <Box
        sx={{
          mb: 2.5,
          p: 1.25,
          borderRadius: 2,
          bgcolor: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:tuning-bold" width={18} sx={{ color: '#0284C7' }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
            محاكي المعاينة السريعة للحالات (UI Preview):
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="1. طلب جديد (قرار المحاضر)"
            size="small"
            clickable
            color={isNew ? 'primary' : 'default'}
            onClick={() => onStatusChange?.('new')}
            sx={{ fontWeight: 700, fontSize: 11.5 }}
          />
          <Chip
            label="2. بانتظار اعتماد الإدارة"
            size="small"
            clickable
            color={isPendingAdmin ? 'warning' : 'default'}
            onClick={() => onStatusChange?.('pending_admin')}
            sx={{ fontWeight: 700, fontSize: 11.5 }}
          />
          <Chip
            label="3. طلب معتمد (محتوى مسجل)"
            size="small"
            clickable
            color={isActive && isRecorded ? 'success' : 'default'}
            onClick={() => {
              onStatusChange?.('active');
              onServiceTypeChange?.('recorded');
            }}
            sx={{ fontWeight: 700, fontSize: 11.5 }}
          />
          <Chip
            label="4. طلب معتمد (جلسة مباشرة)"
            size="small"
            clickable
            color={isActive && !isRecorded ? 'error' : 'default'}
            onClick={() => {
              onStatusChange?.('active');
              onServiceTypeChange?.('live');
            }}
            sx={{ fontWeight: 700, fontSize: 11.5 }}
          />
        </Stack>
      </Box>

      {/* Main Title & Action Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        {/* Right Side in RTL (First child): Title, Badge, and Status Subline */}
        <Box sx={{ textAlign: 'start' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: 20, md: 24 },
              }}
            >
              تفاصيل الطلب الخاص #{request.id}
            </Typography>

            {/* Service badge */}
            <Chip
              icon={<Iconify icon={isRecorded ? 'solar:videocamera-record-bold' : 'solar:users-group-rounded-bold'} width={16} />}
              label={isRecorded ? 'محتوى مسجل' : 'جلسة مباشرة'}
              size="small"
              sx={{
                bgcolor: isRecorded ? '#EFF6FF' : '#EEF2FF',
                color: isRecorded ? '#2563EB' : '#4F46E5',
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 1.5,
                '& .MuiChip-icon': {
                  color: isRecorded ? '#2563EB' : '#4F46E5',
                },
              }}
            />
          </Stack>

          {/* Status Label & Dot (Directly under title) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isActive ? '#10B981' : isNew ? '#0284C7' : '#D97706',
              }}
            />
            <Typography
              sx={{
                color: isActive ? '#15803D' : isNew ? '#0284C7' : '#D97706',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {isActive ? 'طلب معتمد نشط' : isNew ? 'طلب جديد' : 'بانتظار اعتماد الإدارة'}
            </Typography>
          </Box>

          {/* Date info subline for new and pending states */}
          {!isActive && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="solar:calendar-date-bold" width={16} />
                تاريخ التقديم: {request.submittedAtFormatted || '5 أكتوبر 2026'}
              </Typography>

              {isPendingAdmin && request.acceptedAtFormatted && (
                <>
                  <Typography sx={{ color: '#CBD5E1', fontSize: 12 }}>|</Typography>
                  <Typography sx={{ fontSize: 12.5, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:check-circle-bold" width={16} />
                    تم قبول الطلب من المحاضر: {request.acceptedAtFormatted}
                  </Typography>
                </>
              )}
            </Stack>
          )}
        </Box>

        {/* Left Side in RTL (Second child): Finish button if Active */}
        {isActive && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:check-read-bold" width={18} />}
            onClick={() => setFinishDialogOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 13,
              borderColor: '#FCA5A5',
              color: '#DC2626',
              bgcolor: '#FEF2F2',
              px: 2.5,
              py: 0.85,
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#FEE2E2',
                borderColor: '#F87171',
              },
            }}
          >
            إنهاء الخدمة
          </Button>
        )}
      </Box>

      {/* Extended metadata bar for active requests (Images 1 & 2) */}
      {isActive && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Chip
            label={`رقم الطلب: ${request.id}`}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: 12 }}
          />
          <Chip
            icon={<Iconify icon="solar:calendar-linear" width={15} />}
            label={`تاريخ التقديم: ${request.submittedAtFormatted || '5 أكتوبر 2026'}`}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: 12 }}
          />
          <Chip
            icon={<Iconify icon="solar:check-circle-bold" width={15} />}
            label="معتمد (Approved)"
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 12 }}
          />
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold" width={15} />}
            label="قيد التنفيذ (In Progress)"
            size="small"
            sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: 12 }}
          />
          <Chip
            icon={<Iconify icon="solar:play-circle-bold" width={15} />}
            label={`نوع الخدمة: ${isRecorded ? 'محتوى مسجل معتمد' : 'جلسة مباشرة'}`}
            size="small"
            sx={{ bgcolor: '#F8FAFC', color: '#334155', fontWeight: 700, fontSize: 12 }}
          />
        </Box>
      )}

      {/* Finish Service Confirmation Dialog */}
      <Dialog
        open={finishDialogOpen}
        onClose={() => setFinishDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'center' }}>
          تأكيد إنهاء الخدمة للطلب
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 14, mb: 1 }}>
            هل أنت متأكد من رغبتك في إنهاء خدمة هذا الطلب وإغلاقه؟
          </Typography>
          <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700, bgcolor: '#FEF2F2', p: 1.5, borderRadius: 2 }}>
            سيتم اعتماد كافة الساعات المسجلة وصرف صافي المستحقات إلى محفظتك مباشرة.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setFinishDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            تراجع
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmFinish}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            تأكيد الإنهاء
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

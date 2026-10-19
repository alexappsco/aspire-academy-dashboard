'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { PrivateRequestItem, PrivateRequestStatus, PrivateRequestServiceType } from 'src/types/private-request';

interface Props {
  request: PrivateRequestItem;
  showPreviewSwitcher?: boolean;
  onStatusChange?: (newStatus: PrivateRequestStatus) => void;
  onServiceTypeChange?: (newType: PrivateRequestServiceType) => void;
  onFinishService?: () => Promise<boolean | void> | void;
  isFinishing?: boolean;
}

export default function RequestHeaderCard({
  request,
  showPreviewSwitcher = false,
  onStatusChange,
  onServiceTypeChange,
  onFinishService,
  isFinishing = false,
}: Props) {
  const toast = useToast();
  const t = useTranslations('PrivateRequests');
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const handleConfirmFinish = async () => {
    if (onFinishService) {
      const res = await onFinishService();
      if (res !== false) {
        setFinishDialogOpen(false);
      }
    } else {
      setFinishDialogOpen(false);
    }
  };

  const isRecorded =
    request.serviceType === 'recorded' || (request as any).type === 'Recorded' || (request as any).type === 2;

  const rawStatus = String(request.status).toLowerCase();
  const isNew = rawStatus === 'new' || rawStatus === 'pending' || rawStatus === '1';
  const isPendingAdmin =
    rawStatus === 'pending_admin' || rawStatus === 'awaitingadminreview' || rawStatus === '2';
  const isActive = rawStatus === 'active' || rawStatus === '3';
  const isCompleted = rawStatus === 'completed' || rawStatus === '4';
  const isRejected = rawStatus === 'rejected' || rawStatus === '5';
  const isCancelled = rawStatus === 'cancelled' || rawStatus === '6';

  const getStatusLabel = () => {
    if (isNew) return t('details.header.status_new');
    if (isPendingAdmin) return t('details.header.status_pending_admin');
    if (isActive) return t('details.header.status_active');
    if (isCompleted) return t('details.header.status_completed');
    if (isRejected) return t('details.header.status_rejected');
    if (isCancelled) return t('details.header.status_cancelled');
    return t('details.header.status_new');
  };

  const getStatusColor = () => {
    if (isNew) return { dot: '#0284C7', text: '#0284C7' };
    if (isPendingAdmin) return { dot: '#D97706', text: '#D97706' };
    if (isActive) return { dot: '#10B981', text: '#15803D' };
    if (isCompleted) return { dot: '#059669', text: '#059669' };
    if (isRejected) return { dot: '#DC2626', text: '#DC2626' };
    if (isCancelled) return { dot: '#64748B', text: '#64748B' };
    return { dot: '#0284C7', text: '#0284C7' };
  };

  const statusColor = getStatusColor();
  const displayId =
    request.id?.length > 12 ? `${request.id.slice(0, 8)}...` : request.id;

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
      {/* Optional Preview Switcher for testing */}
      {showPreviewSwitcher && (
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
      )}

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
              {t('details.header.title', { id: displayId })}
            </Typography>

            {/* Service badge */}
            <Chip
              icon={<Iconify icon={isRecorded ? 'solar:videocamera-record-bold' : 'solar:users-group-rounded-bold'} width={16} />}
              label={isRecorded ? t('filters.recorded') : t('filters.live')}
              size="small"
              sx={{
                bgcolor: isRecorded ? '#EFF6FF' : '#EEF2FF',
                color: isRecorded ? '#2563EB' : '#4F46E5',
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 1.5,
                px: 1,
                height: 26,
                '& .MuiChip-icon': {
                  color: isRecorded ? '#2563EB' : '#4F46E5',
                  margin: '0 !important',
                  marginInlineEnd: '6px !important',
                },
                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />

            {/* Request Type badge (Individual vs Group) */}
            {request.participants && request.participants.length > 0 ? (
              <Chip
                label={t('group_badge', { count: request.participants.length + 1 })}
                size="small"
                sx={{
                  bgcolor: '#F3E8FF',
                  color: '#9333EA',
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 1.5,
                  px: 1,
                  height: 26,
                }}
              />
            ) : (
              <Chip
                label={t('individual_badge')}
                size="small"
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 1.5,
                  px: 1,
                  height: 26,
                }}
              />
            )}
          </Stack>

          {/* Status Label & Dot (Directly under title) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: statusColor.dot,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                color: statusColor.text,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {getStatusLabel()}
            </Typography>
          </Box>

          {/* Date info subline for new and pending states */}
          {!isActive && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
              <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.85 }}>
                <Iconify icon="solar:calendar-date-bold" width={16} />
                {t('details.header.submission_date_label', { date: request.submittedAtFormatted || '—' })}
              </Typography>

              {isPendingAdmin && request.acceptedAtFormatted && (
                <>
                  <Typography sx={{ color: '#CBD5E1', fontSize: 12 }}>|</Typography>
                  <Typography sx={{ fontSize: 12.5, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.85 }}>
                    <Iconify icon="solar:check-circle-bold" width={16} />
                    {t('details.header.accepted_by_instructor_label', { date: request.acceptedAtFormatted })}
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
            startIcon={
              isFinishing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:check-read-bold" width={18} />
              )
            }
            onClick={() => setFinishDialogOpen(true)}
            disabled={isFinishing}
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
              '& .MuiButton-startIcon': {
                margin: '0 !important',
                marginInlineEnd: '8px !important',
              },
              '&:hover': {
                bgcolor: '#FEE2E2',
                borderColor: '#F87171',
              },
            }}
          >
            {isFinishing ? t('notifications.finishing') : t('details.finish_service')}
          </Button>
        )}
      </Box>

      {/* Extended metadata bar for active requests */}
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
            label={t('details.header.request_id_label', { id: request.id })}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: 12, px: 1, height: 26 }}
          />
          <Chip
            icon={<Iconify icon="solar:calendar-linear" width={15} />}
            label={t('details.header.submission_date_label', { date: request.submittedAtFormatted || '—' })}
            size="small"
            sx={{
              bgcolor: '#F1F5F9',
              color: '#475569',
              fontWeight: 600,
              fontSize: 12,
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
          <Chip
            icon={<Iconify icon="solar:check-circle-bold" width={15} />}
            label={t('details.header.approved')}
            size="small"
            sx={{
              bgcolor: '#DCFCE7',
              color: '#15803D',
              fontWeight: 700,
              fontSize: 12,
              px: 1,
              height: 26,
              '& .MuiChip-icon': {
                color: '#15803D',
                margin: '0 !important',
                marginInlineEnd: '6px !important',
              },
              '& .MuiChip-label': {
                px: 0.5,
              },
            }}
          />
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold" width={15} />}
            label={t('details.header.in_progress')}
            size="small"
            sx={{
              bgcolor: '#E0F2FE',
              color: '#0369A1',
              fontWeight: 700,
              fontSize: 12,
              px: 1,
              height: 26,
              '& .MuiChip-icon': {
                color: '#0369A1',
                margin: '0 !important',
                marginInlineEnd: '6px !important',
              },
              '& .MuiChip-label': {
                px: 0.5,
              },
            }}
          />
          <Chip
            icon={<Iconify icon="solar:play-circle-bold" width={15} />}
            label={t('details.header.service_type_label', {
              type: isRecorded ? t('details.header.recorded_approved') : t('details.header.live'),
            })}
            size="small"
            sx={{
              bgcolor: '#F8FAFC',
              color: '#334155',
              fontWeight: 700,
              fontSize: 12,
              px: 1,
              height: 26,
              '& .MuiChip-icon': {
                color: '#334155',
                margin: '0 !important',
                marginInlineEnd: '6px !important',
              },
              '& .MuiChip-label': {
                px: 0.5,
              },
            }}
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
          {t('details.header.finish_dialog_title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 14, mb: 1 }}>
            {t('details.header.finish_dialog_desc')}
          </Typography>
          <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700, bgcolor: '#FEF2F2', p: 1.5, borderRadius: 2 }}>
            {t('details.header.finish_dialog_note')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setFinishDialogOpen(false)}
            disabled={isFinishing}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {t('details.header.finish_dialog_cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmFinish}
            disabled={isFinishing}
            startIcon={isFinishing ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {isFinishing ? t('notifications.finishing') : t('details.header.finish_dialog_confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

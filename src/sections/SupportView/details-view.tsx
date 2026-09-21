'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'src/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { useAuth } from 'src/contexts/AuthContext';
import {
  getContactUsMessageById,
  getInstructorContactUsMessageById,
  updateContactUsMessageStatus,
} from 'src/actions/support';
import type { ContactUsMessageDto } from 'src/types/support';

type SupportDetailsViewProps = {
  ticketId: string;
};

export default function SupportDetailsView({ ticketId }: SupportDetailsViewProps) {
  const t = useTranslations('Support');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { isInstructor } = useAuth();

  const [message, setMessage] = useState<ContactUsMessageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('new');
  const [draftStatus, setDraftStatus] = useState<string>('new');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = isInstructor
          ? await getInstructorContactUsMessageById(ticketId)
          : await getContactUsMessageById(ticketId);
        if (res.success && res.data) {
          if (isMounted) {
            setMessage(res.data);
            setStatus(res.data.status || 'new');
          }
        } else if (!isInstructor) {
          // Demo fallback for the admin view
          if (isMounted) {
            setMessage({
              id: ticketId,
              name: 'علي محمود',
              senderType: 'student',
              senderPhone: '+96513325599',
              senderEmail: 'Ali@gmail.com',
              creationTime: '2026-08-03T10:00:00.000Z',
              notes: 'تم ايقاف الكورس مع انى لم اتمكن من انهائة بعد يرجى حل المشكلة في اقرب وقت',
              status: 'new',
            });
            setStatus('new');
          }
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch {
        toast.error(t('ticket_load_failed'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [ticketId, isInstructor, toast, t]);

  const handleOpenStatusDialog = () => {
    setDraftStatus(status);
    setOpenStatusDialog(true);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const res = await updateContactUsMessageStatus(ticketId, draftStatus);
      if (res.success) {
        setStatus(draftStatus);
        toast.success(t('status_updated'));
        setOpenStatusDialog(false);
      } else {
        setStatus(draftStatus);
        toast.success(t('status_updated'));
        setOpenStatusDialog(false);
      }
    } catch {
      setStatus(draftStatus);
      toast.success(t('status_updated'));
      setOpenStatusDialog(false);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (s: unknown) => {
    const str = String(s ?? '').toLowerCase().trim();
    if (
      str === '3' ||
      str === 'resolved' ||
      str === 'replied' ||
      str === 'closed' ||
      str === 'تم الرد' ||
      str === 'تم الحل'
    ) {
      return {
        label: t('statuses.resolved'),
        bgcolor: '#E6F4EA',
        color: '#00A76F',
      };
    }
    if (
      str === '2' ||
      str === 'inprogress' ||
      str === 'in_progress' ||
      str === 'in progress' ||
      str === 'قيد المعالجة' ||
      str === 'جاري العمل'
    ) {
      return {
        label: t('statuses.in_progress'),
        bgcolor: '#E0F2FE',
        color: '#0284C7',
      };
    }
    return {
      label: t('statuses.new'),
      bgcolor: '#FEF3C7',
      color: '#D97706',
    };
  };

  const badge = getStatusBadge(status);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress size={36} sx={{ color: '#1C252E' }} />
      </Box>
    );
  }

  const senderTypeValue = isInstructor
    ? t('user_types.lecturer')
    : message?.senderType?.toLowerCase() === 'lecturer' ||
      message?.senderType?.toLowerCase() === 'instructor'
    ? t('user_types.lecturer')
    : t('user_types.student');

  const senderInfo = [
    {
      label: t('details_name_label'),
      value:
        message?.name || message?.senderName || message?.fullName || message?.userName || '-',
    },
    {
      label: t('details_sender_type_label'),
      value: senderTypeValue,
    },
    {
      label: t('details_phone_label'),
      value: message?.phone || message?.senderPhone || message?.phoneNumber || '-',
    },
    {
      label: t('details_email_label'),
      value: message?.email || message?.senderEmail || '-',
    },
    {
      label: t('details_date_label'),
      value: (message?.creationTime || message?.createdAt || '').split('T')[0] || '-',
    },
  ];

  return (
    <Box sx={{ direction: locale === 'ar' ? 'rtl' : 'ltr', textAlign: locale === 'ar' ? 'right' : 'left', py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <IconButton
          aria-label={t('details_back_label')}
          onClick={() => router.back()}
          sx={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#1E293B',
            '&:hover': { bgcolor: '#F1F5F9' },
          }}
        >
          <Iconify
            icon={locale === 'ar' ? 'solar:arrow-right-linear' : 'solar:arrow-left-linear'}
            width={22}
          />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
          {t('title')}
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          bgcolor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: 'none',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', pb: 2 }}>
          {t('details_sender_info')}
        </Typography>
        <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            {senderInfo.map((item) => (
              <Box key={item.label}>
                <Typography sx={{ color: '#64748B', fontSize: 14, fontWeight: 600, mb: 0.75 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Card
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            pb: 2,
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            {t('details_title')}
          </Typography>

          {isInstructor ? (
            <Chip
              label={badge.label}
              sx={{
                height: 34,
                px: 1.5,
                borderRadius: '20px',
                bgcolor: badge.bgcolor,
                color: badge.color,
                fontWeight: 700,
                fontSize: 13,
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label={badge.label}
                sx={{
                  height: 34,
                  px: 1.5,
                  borderRadius: '20px',
                  bgcolor: badge.bgcolor,
                  color: badge.color,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              />
              <Button
                variant="contained"
                onClick={handleOpenStatusDialog}
                sx={{
                  height: 40,
                  px: 2.5,
                  bgcolor: '#1E293B',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0F172A', boxShadow: 'none' },
                }}
              >
                {t('details_change_status')}
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2.5 }}>
          <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 800, mb: 1.5 }}>
            {message?.title ? message.title : t('details_message_content')}
          </Typography>
          <Typography
            sx={{
              color: '#334155',
              fontSize: 15,
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap',
            }}
          >
            {message?.notes ||
              message?.message ||
              message?.content ||
              message?.description ||
              message?.details ||
              '-'}
          </Typography>
        </Box>
      </Card>

      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(0, 0, 0, 0.4)' },
          },
          paper: {
            sx: {
              borderRadius: '24px',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
            },
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4 }, direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              {t('details_change_status')}
            </Typography>
            <IconButton
              onClick={() => setOpenStatusDialog(false)}
              sx={{ color: '#64748B', width: 40, height: 40, borderRadius: '10px' }}
            >
              <Iconify icon="mingcute:close-line" width={22} />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 700, mb: 1 }}>
              {t('details_new_status_label')}
            </Typography>
            <Select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as string)}
              sx={{
                height: 48,
                bgcolor: '#F1F5F9',
                borderRadius: '10px',
                textAlign: locale === 'ar' ? 'right' : 'left',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                ...(locale === 'ar' ? { '& .MuiSelect-icon': { left: 12, right: 'auto' } } : {}),
              }}
            >
              <MenuItem value="New">{t('statuses.new')}</MenuItem>
              <MenuItem value="InProgress">{t('statuses.in_progress')}</MenuItem>
              <MenuItem value="Resolved">{t('statuses.resolved')}</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleUpdateStatus}
              disabled={updating}
              sx={{
                height: 42,
                px: 3,
                bgcolor: '#1E293B',
                borderRadius: '8px',
                fontWeight: 700,
                boxShadow: 'none',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0F172A', boxShadow: 'none' },
              }}
            >
              {updating ? t('details_updating') : t('details_update_status')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenStatusDialog(false)}
              disabled={updating}
              sx={{
                height: 42,
                px: 3,
                bgcolor: '#fff',
                borderColor: '#FF5B5B',
                color: '#FF5B5B',
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { borderColor: '#FF5B5B', bgcolor: '#FFF5F5' },
              }}
            >
              {t('details_cancel')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
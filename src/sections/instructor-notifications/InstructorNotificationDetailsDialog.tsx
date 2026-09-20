'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { useTranslations, useLocale } from 'next-intl';

import Iconify from 'src/components/iconify';
import type { InstructorNotificationItemDto } from 'src/types/instructor-notification';
import { normalizeNotificationType } from 'src/types/admin-notification';

interface Props {
  open: boolean;
  onClose: () => void;
  notification: InstructorNotificationItemDto | null;
}

export default function InstructorNotificationDetailsDialog({
  open,
  onClose,
  notification,
}: Props) {
  const t = useTranslations('InstructorNotifications');
  const tTypes = useTranslations('Notifications.types');
  const locale = useLocale();

  if (!notification) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const normType = normalizeNotificationType(notification.type);
  let typeLabel: string = normType;
  try {
    typeLabel = tTypes(normType);
  } catch {
    typeLabel = normType;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
          },
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          px: 2,
          py: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('dialog_details_title')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack spacing={2.5}>
          {/* Optional Image */}
          {notification.imageUrl && (
            <Box
              sx={{
                width: '100%',
                maxHeight: 200,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#F4F6F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E2E8F0',
              }}
            >
              <Box
                component="img"
                src={notification.imageUrl}
                alt={notification.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          {/* Type Badge & Read status & Date */}
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={typeLabel}
                size="small"
                sx={{
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                label={notification.isRead ? t('columns.read') : t('columns.unread')}
                size="small"
                sx={{
                  bgcolor: notification.isRead ? '#F1F5F9' : '#ECFDF5',
                  color: notification.isRead ? '#64748B' : '#059669',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Stack>

            <Typography variant="caption" sx={{ color: '#919EAB', fontWeight: 500 }}>
              {formatDate(notification.createdAt)}
            </Typography>
          </Stack>

          {/* Title */}
          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 0.5 }}>
              {t('columns.title')}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {notification.title}
            </Typography>
          </Box>

          {/* Message */}
          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 1 }}>
              {t('columns.message')}
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                border: '1px solid #F1F3F5',
                color: '#1C252E',
                fontSize: '0.9rem',
                minHeight: 80,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
              }}
            >
              {notification.message}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

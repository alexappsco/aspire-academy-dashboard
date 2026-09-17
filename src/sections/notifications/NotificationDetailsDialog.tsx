'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import { useTranslations, useLocale } from 'next-intl';

import Iconify from 'src/components/iconify';
import type { AdminNotificationItemDto } from 'src/types/admin-notification';

interface Props {
  open: boolean;
  onClose: () => void;
  notification: AdminNotificationItemDto | null;
}

export default function NotificationDetailsDialog({ open, onClose, notification }: Props) {
  const t = useTranslations('Notifications.details');
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

  const getTypeLabel = (type: string) => {
    try {
      return tTypes(type);
    } catch {
      return type;
    }
  };

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
      {/* Header with Title and Close Button */}
      <Stack
        direction="row"
        sx={{
          px: 2,
          py: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1C252E' }}>
          {t('title')}
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
                alt={notification.titleAr}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          {/* Type Badge & Date */}
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={getTypeLabel(notification.type)}
              size="small"
              sx={{
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
            <Typography variant="caption" sx={{ color: '#919EAB', fontWeight: 500 }}>
              {formatDate(notification.createdAt)}
            </Typography>
          </Stack>

          {/* Titles */}
          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 0.5 }}>
              {t('title_ar')}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {notification.titleAr}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 0.5 }}>
              {t('title_en')}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {notification.titleEn}
            </Typography>
          </Box>

          {/* Content Arabic */}
          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 1 }}>
              {t('content_ar')}
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                border: '1px solid #F1F3F5',
                color: '#1C252E',
                fontSize: '0.9rem',
                minHeight: 56,
                whiteSpace: 'pre-wrap',
              }}
            >
              {notification.messageAr}
            </Box>
          </Box>

          {/* Content English */}
          <Box>
            <Typography variant="body2" sx={{ color: '#637381', fontWeight: 600, mb: 1 }}>
              {t('content_en')}
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                border: '1px solid #F1F3F5',
                color: '#1C252E',
                fontSize: '0.9rem',
                minHeight: 56,
                whiteSpace: 'pre-wrap',
              }}
            >
              {notification.messageEn}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import { NotificationItem } from './_mock';

interface Props {
  open: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
}

export default function NotificationDetailsDialog({ open, onClose, notification }: Props) {
  const t = useTranslations('Notifications.details');
  const tUserTypes = useTranslations('Notifications.user_types');

  if (!notification) return null;

  const title = `${notification.title_ar} - ${notification.title_en}`;

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
          }
        }
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
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack spacing={2.5}>
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
              }}
            >
              {notification.content_ar}
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
              }}
            >
              {notification.content_en}
            </Box>
          </Box>

          {/* Footer Metadata */}
          <Stack
            direction="row"
            spacing={4}
            sx={{
              pt: 1.5,
              fontSize: '0.875rem',
              color: '#1B8354',
              fontWeight: 600,
            }}
          >
            <Box>
              <Typography component="span" sx={{ color: '#637381', fontWeight: 600 }}>
                {t('user_type_label')} :{' '}
              </Typography>
              <Typography component="span" sx={{ color: '#1B8354', fontWeight: 700 }}>
                {tUserTypes(notification.userType)}
              </Typography>
            </Box>

            <Box>
              <Typography component="span" sx={{ color: '#637381', fontWeight: 600 }}>
                {t('user_label')} :{' '}
              </Typography>
              <Typography component="span" sx={{ color: '#1B8354', fontWeight: 700 }}>
                {notification.userName}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

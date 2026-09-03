'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('Currencies.dialog');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
            m: 2,
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 2, position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            color: '#94A3B8',
            '&:hover': { color: '#475569', bgcolor: '#F8FAFC' },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>

        {/* Question Text */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#1E293B',
            textAlign: 'center',
            mt: 2,
            mb: 3,
          }}
        >
          {t('delete_title')}
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            sx={{
              minWidth: 100,
              py: 1,
              borderRadius: 2,
              bgcolor: '#BA1A1A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#991B1B' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : t('delete_button')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              minWidth: 100,
              py: 1,
              borderRadius: 2,
              borderColor: '#E2E8F0',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            {t('cancel_button')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

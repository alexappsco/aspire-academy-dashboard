'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('Countries');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
            textAlign: 'center',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1E293B', mb: 2, fontSize: 20 }}
        >
          {t('delete_dialog.title')}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#64748B', mb: 4, fontSize: 14 }}
        >
          {t('delete_dialog.message')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            sx={{
              bgcolor: '#D32F2F',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              minWidth: 100,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#C62828' },
            }}
          >
            {t('delete_dialog.confirm_btn')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#E2E8F0',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              minWidth: 100,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            {t('delete_dialog.cancel_btn')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

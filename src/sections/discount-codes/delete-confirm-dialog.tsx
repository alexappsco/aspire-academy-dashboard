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
  const t = useTranslations('DiscountCodes');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: { sx: { borderRadius: '20px', p: 1.5 } },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
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

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            sx={{
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {t('delete_dialog.confirm_btn')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#E2E8F0',
              color: '#64748B',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
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

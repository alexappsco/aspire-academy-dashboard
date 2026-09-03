'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('MinutesManagement');
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1.5, textAlign: 'center' } },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 4, fontSize: 20 }}>
          {t('dialog.delete_confirm')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={deleting}
            sx={{
              bgcolor: '#D32F2F',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              gap: 1,
              fontWeight: 600,
              fontSize: 15,
              minWidth: 100,
              '&:hover': { bgcolor: '#C62828' },
            }}
          >
            {deleting ? <CircularProgress size={16} color="inherit" /> : null}
            {t('dialog.delete')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            disabled={deleting}
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
            {t('dialog.cancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
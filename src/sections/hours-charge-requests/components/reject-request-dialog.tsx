'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export default function RejectHoursChargeRequestDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations('HoursChargeRequestActions.reject_dialog');
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason('');
      setShowError(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setShowError(true);
      return;
    }
    await onConfirm(trimmedReason);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 2.5, px: { xs: 1, sm: 2 }, py: 2 } } }}
    >
      <DialogContent sx={{ px: { xs: 2, sm: 2 }, py: 1 }}>
        <Typography sx={{ color: '#17243E', fontSize: 24, fontWeight: 800, mb: 1.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ color: '#667085', fontSize: 15, mb: 2.5 }}>
          {t('description')}
        </Typography>

        <Typography component="label" htmlFor="rejection-reason" sx={{ fontWeight: 700, mb: 1.25, display: 'block' }}>
          {t('reason_label')}
        </Typography>
        <TextField
          id="rejection-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (event.target.value.trim()) setShowError(false);
          }}
          placeholder={t('reason_placeholder')}
          error={showError}
          helperText={showError ? t('reason_required') : ' '}
          multiline
          minRows={3}
          fullWidth
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, alignItems: 'flex-start' } }}
        />

        <Typography sx={{ color: '#667085', fontSize: 13, mt: 0.5, mb: 2.5 }}>
          {t('note')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            color="error"
            disabled={loading}
            onClick={() => void handleConfirm()}
            sx={{ minWidth: 195, minHeight: 48, borderRadius: 1.5, fontWeight: 700 }}
          >
            {loading && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
            {t('confirm')}
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            disabled={loading}
            sx={{ minWidth: 140, minHeight: 48, borderRadius: 1.5, bgcolor: '#F5F7FA', color: '#17243E', boxShadow: 'none', '&:hover': { bgcolor: '#E9EDF3', boxShadow: 'none' } }}
          >
            {t('cancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

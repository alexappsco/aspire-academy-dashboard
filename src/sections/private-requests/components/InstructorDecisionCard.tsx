'use client';

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

interface Props {
  onAccept: () => Promise<void> | void;
  onReject: (reason?: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function InstructorDecisionCard({ onAccept, onReject, isSubmitting = false }: Props) {
  const t = useTranslations('PrivateRequests.details.instructor_decision');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAcceptClick = async () => {
    try {
      setIsAccepting(true);
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setIsRejecting(true);
      await onReject(rejectReason.trim());
      setRejectDialogOpen(false);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        mt: 3,
        textAlign: 'start',
      }}
    >
      {/* Title & Subtitle */}
      <Typography sx={{ fontWeight: 800, fontSize: { xs: 16.5, sm: 18 }, color: '#0F172A', mb: 0.5 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#64748B', fontWeight: 500, mb: 3 }}>
        {t('subtitle')}
      </Typography>

      {/* Action Buttons */}
      <Stack spacing={1.75}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting || isAccepting || isRejecting}
          startIcon={
            isAccepting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:like-bold" width={20} />
            )
          }
          onClick={handleAcceptClick}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: 'none',
            '& .MuiButton-startIcon': {
              margin: '0 !important',
              marginInlineEnd: '10px !important',
            },
            '&:hover': {
              bgcolor: '#1E293B',
              boxShadow: 'none',
            },
          }}
        >
          {isAccepting ? t('accepting') : t('accept_btn')}
        </Button>

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting || isAccepting || isRejecting}
          startIcon={<Iconify icon="solar:close-circle-bold" width={20} />}
          onClick={() => setRejectDialogOpen(true)}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#EEF2FF',
            color: '#4338CA',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: 'none',
            '& .MuiButton-startIcon': {
              margin: '0 !important',
              marginInlineEnd: '10px !important',
            },
            '&:hover': {
              bgcolor: '#E0E7FF',
              boxShadow: 'none',
            },
          }}
        >
          {t('reject_btn')}
        </Button>
      </Stack>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !isRejecting && setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'center' }}>
          {t('dialog_title')}
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 13.5, mb: 2, textAlign: 'center' }}>
            {t('dialog_desc')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('reason_placeholder')}
            value={rejectReason}
            disabled={isRejecting}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button
            variant="outlined"
            disabled={isRejecting}
            onClick={() => setRejectDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isRejecting}
            onClick={handleConfirmReject}
            startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {isRejecting ? t('rejecting') : t('confirm_reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

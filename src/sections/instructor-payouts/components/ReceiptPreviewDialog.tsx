'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { PayoutTransaction } from 'src/types/instructor-payout';

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: PayoutTransaction | null;
}

export default function ReceiptPreviewDialog({
  open,
  onClose,
  transaction,
}: Props) {
  const t = useTranslations('InstructorPayouts.receipt_dialog');

  if (!transaction) return null;

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
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 1, textAlign: 'start' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:bill-check-bold" width={22} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A' }}>
              {t('title')}
            </Typography>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {/* Transaction Summary Card */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textAlign: 'start',
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B' }}>{t('reference')}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                {transaction.reference}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B' }}>{t('date')}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                {transaction.date}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B' }}>{t('amount')}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#15803D' }}>
                {Math.abs(transaction.amount).toLocaleString()} {transaction.currency}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Receipt Document / Image Preview Area */}
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px dashed #CBD5E1',
            bgcolor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Iconify icon="solar:document-text-bold" width={56} sx={{ color: '#94A3B8', mb: 1.5 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            {transaction.receiptFileName || 'Bank-Transfer-Receipt.pdf'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>
            {t('receipt_verified')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: '#E2E8F0',
            color: '#64748B',
            fontWeight: 700,
            fontSize: 13.5,
            borderRadius: 2,
            px: 3,
          }}
        >
          {t('close_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

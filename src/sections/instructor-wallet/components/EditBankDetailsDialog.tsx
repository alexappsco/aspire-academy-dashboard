'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { updateInstructorBankDetails } from 'src/actions/instructor-wallet';
import { InstructorWalletDetailsResponse } from 'src/types/instructor-wallet';

interface Props {
  open: boolean;
  onClose: () => void;
  instructor: InstructorWalletDetailsResponse;
  onSuccess: () => void;
}

export default function EditBankDetailsDialog({
  open,
  onClose,
  instructor,
  onSuccess,
}: Props) {
  const t = useTranslations('InstructorWallet.edit_dialog');
  const toast = useToast();

  const [bankName, setBankName] = useState(instructor.bankName || '');
  const [bankAccountHolderName, setBankAccountHolderName] = useState(
    instructor.bankAccountHolderName || ''
  );
  const [iban, setIban] = useState(instructor.iban || '');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBankName(instructor.bankName || '');
      setBankAccountHolderName(instructor.bankAccountHolderName || '');
      setIban(instructor.iban || '');
      setFormError(null);
    }
  }, [open, instructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedBankName = bankName.trim();
    const trimmedHolder = bankAccountHolderName.trim();
    const trimmedIban = iban.trim().replace(/\s+/g, '');

    if (!trimmedBankName || !trimmedHolder || !trimmedIban) {
      setFormError(t('required_fields_error'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateInstructorBankDetails({
        bankName: trimmedBankName,
        bankAccountHolderName: trimmedHolder,
        iban: trimmedIban,
      });

      if (res.success) {
        toast.success(t('success_message'));
        onSuccess();
        onClose();
      } else {
        const errorMsg = res.error || t('error_message');
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('error_message');
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
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
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'start' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
            {t('title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={submitting}
          sx={{ color: '#94A3B8' }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, pt: 1 }}>
          <Stack spacing={2.5}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            {/* Bank Name */}
            <Box sx={{ textAlign: 'start' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {t('bank_name')} *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t('bank_name_placeholder')}
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Account Holder Name */}
            <Box sx={{ textAlign: 'start' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {t('account_holder')} *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={bankAccountHolderName}
                onChange={(e) => setBankAccountHolderName(e.target.value)}
                placeholder={t('account_holder_placeholder')}
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* IBAN */}
            <Box sx={{ textAlign: 'start' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {t('iban')} *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder={t('iban_placeholder')}
                helperText={t('iban_helper')}
                disabled={submitting}
                slotProps={{
                  htmlInput: {
                    style: {
                      fontFamily: 'monospace',
                      direction: 'ltr',
                      letterSpacing: 0.5,
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                  '& .MuiFormHelperText-root': {
                    textAlign: 'start',
                    fontSize: 11.5,
                    color: '#64748B',
                    mt: 0.75,
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 700,
              borderColor: '#CBD5E1',
              color: '#475569',
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {t('cancel_btn')}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 700,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            {submitting ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                <span>{t('saving')}</span>
              </Stack>
            ) : (
              t('save_btn')
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

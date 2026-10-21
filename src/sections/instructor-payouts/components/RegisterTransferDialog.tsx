'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import {
  InstructorDueDetailsResponse,
  InstructorPayoutItem,
  InstructorTransferItem,
} from 'src/types/instructor-payout';
import { createInstructorTransfer } from 'src/actions/instructor-dues';

interface Props {
  open: boolean;
  onClose: () => void;
  instructor: InstructorDueDetailsResponse | InstructorPayoutItem;
  onSuccess: (newTransfer?: InstructorTransferItem) => void;
}

export default function RegisterTransferDialog({
  open,
  onClose,
  instructor,
  onSuccess,
}: Props) {
  const t = useTranslations('InstructorPayouts.dialog');
  const toast = useToast();

  const instructorId =
    'instructorId' in instructor ? instructor.instructorId : instructor.id;
  const instructorName =
    'instructorName' in instructor ? instructor.instructorName : instructor.name;
  const currentDue = instructor.dueNow;
  const currency =
    'currency' in instructor
      ? instructor.currency
      : instructor.currencySymbol || instructor.currencyCode || '';
  const rawIban =
    'bankDetails' in instructor ? instructor.bankDetails.iban : instructor.iban || '';
  const bankName =
    'bankDetails' in instructor ? instructor.bankDetails.bankName : instructor.bankName || '';

  const [amount, setAmount] = useState<string>(String(currentDue > 0 ? currentDue : 0));
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors
  const [amountError, setAmountError] = useState('');
  const [refError, setRefError] = useState('');

  // Reset fields when opening modal
  useEffect(() => {
    if (open) {
      setAmount(String(currentDue > 0 ? currentDue : 0));
      setTransferDate(new Date().toISOString().slice(0, 10));
      setReference('');
      setNote('');
      setSelectedFile(null);
      setAmountError('');
      setRefError('');
    }
  }, [open, currentDue]);

  // Calculate remaining balance dynamically
  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, currentDue - numAmount);

  // Format IBAN masked preview for subtitle
  const maskedIban =
    rawIban && rawIban.length > 8
      ? `${rawIban.slice(0, 4)} .... ${rawIban.slice(-4)}`
      : rawIban || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!numAmount || numAmount <= 0) {
      setAmountError(t('amount_required_error'));
      valid = false;
    } else if (numAmount > currentDue) {
      setAmountError(t('amount_exceeds_due'));
      valid = false;
    } else {
      setAmountError('');
    }

    if (!reference.trim()) {
      setRefError(t('reference_required_error'));
      valid = false;
    } else {
      setRefError('');
    }

    if (!valid) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('Amount', String(numAmount));
      const dateObj = new Date(transferDate);
      formData.append(
        'TransferDate',
        Number.isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString()
      );
      formData.append('BankReferenceNumber', reference.trim());
      if (selectedFile) {
        formData.append('Receipt', selectedFile);
      }
      if (note.trim()) {
        formData.append('Note', note.trim());
      }

      const res = await createInstructorTransfer(instructorId, formData);

      if (res.success) {
        toast.success(t('transfer_success_message'));
        onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.error || t('transfer_error_message'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('transfer_error_message'));
    } finally {
      setIsSubmitting(false);
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
            p: 1,
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ p: 2.5, pb: 1, textAlign: 'start' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
              {t('title')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.5 }}>
              {t('subtitle', {
                name: instructorName,
                bank: bankName,
                iban: maskedIban,
              })}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        {/* Warning Banner */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: '#FFFBEB',
            border: '1px solid #FEF3C7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            textAlign: 'start',
          }}
        >
          <Iconify
            icon="solar:danger-triangle-bold"
            width={22}
            sx={{ color: '#D97706', flexShrink: 0, mt: 0.25 }}
          />
          <Typography sx={{ fontSize: 12.5, color: '#92400E', fontWeight: 600, lineHeight: 1.6 }}>
            {t('warning_notice')}
          </Typography>
        </Box>

        <Stack spacing={2.5} sx={{ textAlign: 'start' }}>
          {/* Row: Amount + Transfer Date */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Amount */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
                {t('transfer_amount')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                error={Boolean(amountError)}
                helperText={
                  amountError ||
                  t('amount_helper', { due: currentDue.toLocaleString(), currency })
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                          {currency}
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiFormHelperText-root': {
                    color: amountError ? '#DC2626' : '#64748B',
                    fontSize: 12,
                    mx: 0.5,
                  },
                }}
              />
            </Box>

            {/* Transfer Date */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
                {t('transfer_date')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </Stack>

          {/* Reference Number */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
              {t('bank_reference')}
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t('bank_reference_placeholder')}
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                setRefError('');
              }}
              error={Boolean(refError)}
              helperText={refError}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiFormHelperText-root': { color: '#DC2626', fontSize: 12, mx: 0.5 },
              }}
            />
          </Box>

          {/* Upload Receipt File Area */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
              {t('transfer_receipt')}
            </Typography>
            {selectedFile ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Iconify icon="solar:file-check-bold" width={24} sx={{ color: '#10B981' }} />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={handleRemoveFile} size="small" sx={{ color: '#DC2626' }}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Box>
            ) : (
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  borderRadius: 2,
                  border: '2px dashed #CBD5E1',
                  bgcolor: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#94A3B8',
                    bgcolor: '#F1F5F9',
                  },
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <Iconify
                  icon="solar:upload-track-linear"
                  width={36}
                  sx={{ color: '#64748B', mb: 1 }}
                />
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  {t('drop_receipt_prompt')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
                  {t('file_limits_hint')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Optional Note */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
              {t('optional_note')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('note_placeholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Live Remaining Due Balance Preview */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
              {t('due_after_registration')}
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
              {remainingBalance.toLocaleString()} {currency}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
          }}
        >
          {isSubmitting ? t('submitting') : t('confirm_btn')}
        </Button>

        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            borderColor: '#E2E8F0',
            color: '#64748B',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
          }}
        >
          {t('cancel_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

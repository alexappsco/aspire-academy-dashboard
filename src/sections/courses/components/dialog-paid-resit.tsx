'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Iconify from 'src/components/iconify';

export interface PaymentReceiptData {
  refNumber: string;
  bankName: string;
  bankSubtext: string;
  amount: number;
  currency: string;
  amountInWords: string;
  transactionTime: string;
  senderName: string;
  receiverName: string;
  iban: string;
  purpose: string;
}

interface PaymentReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  data?: PaymentReceiptData;
}

const DEFAULT_RECEIPT_DATA: PaymentReceiptData = {
  refNumber: 'TRF-2026-9812450',
  bankName: 'بنك مصر • Banque Misr',
  bankSubtext: 'إشعار تحويل مصرفي إلكتروني رسمي',
  amount: 450.0,
  currency: 'جنيه مصري (EGP)',
  amountInWords: 'فقط أربعمائة وخمسون جنيهاً مصرياً لا غير',
  transactionTime: '12 أغسطس 2026 - 10:45 ص',
  senderName: 'أحمد محمد علي (****4892)',
  receiverName: 'أكاديمية أسباير للتعليم الطبي (Aspire)',
  iban: 'EG3400020001000000284918234',
  purpose: 'رسوم دورة أساسيات أمراض القلب',
};

export default function PaymentReceiptDialog({
  open,
  onClose,
  onAccept,
  onReject,
  data = DEFAULT_RECEIPT_DATA,
}: PaymentReceiptDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1.5,
            direction: 'rtl',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{ px: 2, pt: 1, pb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Iconify icon="eva:close-fill" width={22} />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#1E293B' }}>
          فحص إيصال الدفع
        </Typography>
        <Box sx={{ width: 28 }} />
      </Stack>

      <DialogContent sx={{ px: 2, py: 1 }}>
        {/* Main Receipt Container */}
        <Box
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: 3,
            p: 2.5,
            mb: 3,
            position: 'relative',
            bgcolor: '#FFFFFF',
          }}
        >
          {/* Top Bank & Status Bar */}
          <Stack
            direction="row"
            sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
              <Chip
                label="عملية تحويل ناجحة"
                size="small"
                icon={<Iconify icon="eva:checkmark-circle-2-fill" width={14} color="#10B981" />}
                sx={{
                  bgcolor: '#E6F4EA',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: 11,
                  height: 24,
                  px: 0.5,
                  border: '1px solid #A7F3D0',
                  '& .MuiChip-icon': { color: '#10B981' },
                }}
              />
              <Typography sx={{ fontSize: 10.5, color: '#94A3B8', pt: 0.3, px: 0.5 }}>
                {data.refNumber}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B' }}>
                  {data.bankName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                  {data.bankSubtext}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #BAE6FD',
                }}
              >
                <Iconify icon="solar:bank-bold" width={22} />
              </Box>
            </Stack>
          </Stack>

          {/* Amount Box */}
          <Box
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: 3,
              p: 2.5,
              textAlign: 'center',
              border: '1px solid #F1F3F5',
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600, mb: 0.5 }}>
              المبلغ المحول
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#0F172A' }}>
              {data.amount.toFixed(2)}{' '}
              <Box component="span" sx={{ fontSize: 15, color: '#0D9488', fontWeight: 700 }}>
                {data.currency}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#94A3B8', mt: 0.5 }}>
              {data.amountInWords}
            </Typography>
          </Box>

          {/* Table Data Details with Shield Watermark */}
          <Box sx={{ position: 'relative' }}>
            {/* Background Shield Watermark */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.03,
                pointerEvents: 'none',
              }}
            >
              <Iconify icon="solar:shield-check-bold" width={240} />
            </Box>

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <ReceiptRow label="رقم المرجع المصرفي" value={data.refNumber} />
              <ReceiptRow label="تاريخ وتوقيت العملية" value={data.transactionTime} />
              <ReceiptRow label="اسم المحول (الراسل)" value={data.senderName} />
              <ReceiptRow label="اسم المستفيد" value={data.receiverName} isHighlight />
              <ReceiptRow label="الحساب المحول إليه (IBAN)" value={data.iban} isMonospace />
              <ReceiptRow label="الغرض من التحويل" value={data.purpose} />
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: 'dotted', my: 2.5, borderColor: '#E2E8F0' }} />

          {/* Footer Receipt Verification Stamp */}
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:qr-code-bold" width={34} sx={{ color: '#334155' }} />
              <Typography sx={{ fontSize: 8.5, color: '#94A3B8', fontWeight: 700, mt: 0.2 }}>
                VERIFIED-REC
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: 10.5, color: '#64748B', textAlign: 'right', lineHeight: 1.4 }}>
                إيصال إلكتروني صادر ومعتمد <br />
                لا يتطلب توقيعاً خطياً من البنك
              </Typography>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px border #A7F3D0',
                }}
              >
                <Iconify icon="solar:verified-check-bold" width={18} />
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={onAccept}
            startIcon={<Iconify icon="eva:checkmark-fill" width={20} />}
            sx={{
              bgcolor: '#059669',
              color: '#FFFFFF',
              borderRadius: 3,
              py: 1.3,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
            }}
          >
            قبول
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={onReject}
            startIcon={<Iconify icon="eva:close-fill" width={20} />}
            sx={{
              bgcolor: '#E11D48',
              color: '#FFFFFF',
              borderRadius: 3,
              py: 1.3,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#BE123C', boxShadow: 'none' },
            }}
          >
            رفض
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// Sub-component for structured Rows
function ReceiptRow({
  label,
  value,
  isHighlight = false,
  isMonospace = false,
}: {
  label: string;
  value: string;
  isHighlight?: boolean;
  isMonospace?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography
        sx={{
          fontSize: 13,
          color: isHighlight ? '#0D9488' : '#1E293B',
          fontWeight: isHighlight ? 700 : 600,
          fontFamily: isMonospace ? 'monospace' : 'inherit',
          direction: isMonospace ? 'ltr' : 'inherit',
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}
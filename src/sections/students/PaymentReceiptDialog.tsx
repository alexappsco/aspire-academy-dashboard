'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
import { StudentOrderPayment } from 'src/types/student';

export interface PaymentReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  order?: StudentOrderPayment | null;
  studentName?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function PaymentReceiptDialog({
  open,
  onClose,
  order,
  studentName = 'أحمد محمد علي',
  onAccept,
  onReject,
}: PaymentReceiptDialogProps) {
  // Default fallback values matching the official receipt specification
  const bankName = 'بنك مصر • Banque Misr';
  const receiptSubtitle = 'إشعار تحويل مصرفي إلكتروني رسمي';
  const refCode = 'TRF-2026-9812450';
  const amountNumber = '450.00';
  const currencyText = 'جنيه مصري (EGP)';
  const amountTafqeet = 'فقط أربعمائة وخمسون جنيهاً مصرياً لا غير';
  const transactionTime = '12 أغسطس 2026 - 10:45 ص';
  const senderText = `${studentName} (****4892)`;
  const beneficiaryText = 'أكاديمية أسباير للتعليم الطبي (Aspire)';
  const ibanText = 'EG3400020001000000284918234';
  const purposeText = order?.itemTitle || 'رسوم دورة أساسيات أمراض القلب';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 48px rgba(15, 23, 42, 0.12)',
            maxWidth: 580,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* 1. Header: Title & Close Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: 18,
          }}
        >
          فحص إيصال الدفع
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0, pt: 2.5 }}>
        {/* 2. Bank Header Banner */}
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
          }}
        >
          {/* Status Chip & Ref (Left side in RTL) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Chip
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00A76F' }} />
                  <span>عملية تحويل ناجحة</span>
                </Stack>
              }
              size="small"
              sx={{
                bgcolor: '#ECFDF5',
                color: '#059669',
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 2,
                px: 0.5,
                height: 26,
              }}
            />
            <Typography
              sx={{
                color: '#94A3B8',
                fontSize: 11.5,
                fontWeight: 600,
                mt: 0.5,
                px: 0.5,
                fontFamily: 'monospace, sans-serif',
              }}
            >
              {refCode}
            </Typography>
          </Box>

          {/* Bank Info & Logo (Right side in RTL) */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 15, lineHeight: 1.3 }}>
                {bankName}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 500, mt: 0.25 }}>
                {receiptSubtitle}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: '#E6F8F3',
                border: '1px solid #A7F3D0',
                color: '#00966D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:buildings-2-bold" width={24} />
            </Box>
          </Stack>
        </Stack>

        {/* 3. Amount Box */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              color: '#64748B',
              fontSize: 13,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            المبلغ المحول
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: 'center',
              alignItems: 'baseline',
              gap: 1,
              my: 0.25,
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                color: '#007A78',
                fontSize: { xs: 15, sm: 17 },
              }}
            >
              {currencyText}
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                color: '#0F172A',
                fontSize: { xs: 32, sm: 38 },
                lineHeight: 1.1,
                letterSpacing: -0.5,
              }}
            >
              {amountNumber}
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: '#64748B',
              fontSize: 12,
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            {amountTafqeet}
          </Typography>
        </Box>

        {/* 4. Transaction Details Card with Watermark */}
        <Box
          sx={{
            position: 'relative',
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #F1F5F9',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          {/* Subtle Shield Watermark */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.035,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={240} sx={{ color: '#0F172A' }} />
          </Box>

          <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
            {/* Row 1: Reference */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 700, fontFamily: 'monospace, sans-serif' }}>
                {refCode}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                رقم المرجع المصرفي
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#F8FAFC' }} />

            {/* Row 2: Date & Time */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 700 }}>
                {transactionTime}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                تاريخ وتوقيت العملية
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#F8FAFC' }} />

            {/* Row 3: Sender Name */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 700 }}>
                {senderText}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                اسم المحول (الراسل)
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#F8FAFC' }} />

            {/* Row 4: Beneficiary Name */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#007A78', fontSize: 13.5, fontWeight: 800 }}>
                {beneficiaryText}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                اسم المستفيد
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#F8FAFC' }} />

            {/* Row 5: IBAN */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700, fontFamily: 'monospace, sans-serif', letterSpacing: 0.2 }}>
                {ibanText}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                الحساب المحول إليه (IBAN)
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#F8FAFC' }} />

            {/* Row 6: Purpose */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 700 }}>
                {purposeText}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                الغرض من التحويل
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* 5. Verification Footer Seal & QR */}
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            py: 1,
            mb: 2.5,
          }}
        >
          {/* Left: QR Code info */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                p: 0.5,
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.5,
              }}
            >
              <Iconify icon="solar:qr-code-bold" width={26} sx={{ color: '#1E293B' }} />
            </Box>
            <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.5 }}>
              VERIFIED-REC
            </Typography>
          </Box>

          {/* Right: Stamp & Note */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                إيصال إلكتروني صادر ومعتمد
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, mt: 0.25 }}>
                لا يتطلب توقيعاً خطياً من البنك
              </Typography>
            </Box>

            {/* Circular Stamp Badge */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px dashed #00A76F',
                bgcolor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 9.5, fontWeight: 800, lineHeight: 1 }}>معتمد</Typography>
              <Typography sx={{ fontSize: 7.5, fontWeight: 800, lineHeight: 1, mt: 0.25 }}>BM-AUTH</Typography>
            </Box>
          </Stack>
        </Stack>

        {/* 6. Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ gap: 2 }}>
          {/* Accept / Approve Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              if (onAccept) onAccept();
              onClose();
            }}
            startIcon={<Iconify icon="solar:check-read-linear" width={20} />}
            sx={{
              bgcolor: '#00966D',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 15,
              py: 1.25,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(0, 150, 109, 0.25)',
              '&:hover': {
                bgcolor: '#007A58',
                boxShadow: '0 6px 20px rgba(0, 150, 109, 0.35)',
              },
            }}
          >
            قبول
          </Button>

          {/* Reject Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              if (onReject) onReject();
              onClose();
            }}
            startIcon={<Iconify icon="mingcute:close-line" width={18} />}
            sx={{
              bgcolor: '#E11D48',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 15,
              py: 1.25,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
              '&:hover': {
                bgcolor: '#BE123C',
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.35)',
              },
            }}
          >
            رفض
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

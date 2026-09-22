'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

export interface PaymentReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  order?: any | null;
  data?: any | null;
  studentName?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

function resolveReceiptUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const url = String(rawUrl).trim();
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_HOST_API || '';
  const cleanBase = base.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  return `${cleanBase}/${url.replace(/^\/+/, '')}`;
}

export default function PaymentReceiptDialog({
  open,
  onClose,
  order,
  data,
  studentName,
  onAccept,
  onReject,
}: PaymentReceiptDialogProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const currentOrder = order || data || null;
  const rawReceiptUrl = currentOrder?.receiptUrl || currentOrder?.receipt_url || '';
  const receiptUrl = resolveReceiptUrl(rawReceiptUrl);

  const buyerName =
    currentOrder?.buyerName || studentName || currentOrder?.studentName || '';
  const orderId = currentOrder?.id
    ? `#ORD-${String(currentOrder.id).slice(0, 8).toUpperCase()}`
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 48px rgba(15, 23, 42, 0.12)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: 16, sm: 18 },
            }}
          >
            {isRtl ? 'صورة إيصال التحويل' : 'Payment Receipt Image'}
          </Typography>
          {(orderId || buyerName) && (
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 500, mt: 0.25 }}>
              {buyerName ? `${buyerName} • ` : ''}
              {orderId}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {receiptUrl && !imgError && (
            <Button
              size="small"
              variant="outlined"
              component="a"
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Iconify icon="solar:maximize-square-3-linear" width={16} />}
              sx={{
                borderRadius: 2,
                borderColor: '#E2E8F0',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: 12,
                height: 32,
                textTransform: 'none',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE' },
              }}
            >
              {isRtl ? 'عرض بالحجم الكامل' : 'Open full size'}
            </Button>
          )}

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
        </Stack>
      </Box>

      {/* Content: The Receipt Image */}
      <DialogContent sx={{ p: 0, py: 2.5 }}>
        {receiptUrl && !imgError ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minHeight: 280,
              maxHeight: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F8FAFC',
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              overflow: 'auto',
              p: 1.5,
            }}
          >
            {imgLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(248, 250, 252, 0.8)',
                  zIndex: 2,
                }}
              >
                <CircularProgress size={32} sx={{ color: '#008767' }} />
              </Box>
            )}

            <Box
              component="img"
              src={receiptUrl}
              alt={isRtl ? 'إيصال الدفع' : 'Payment Receipt'}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
              sx={{
                maxWidth: '100%',
                maxHeight: '68vh',
                objectFit: 'contain',
                borderRadius: 1.5,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              bgcolor: '#F8FAFC',
              borderRadius: 2.5,
              border: '1px dashed #CBD5E1',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
                color: '#94A3B8',
              }}
            >
              <Iconify icon="solar:document-text-bold" width={28} />
            </Box>
            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 15, mb: 0.5 }}>
              {imgError
                ? isRtl
                  ? 'تعذر تحميل صورة الإيصال'
                  : 'Failed to load receipt image'
                : isRtl
                  ? 'لا توجد صورة إيصال مرفقة لهذا الطلب'
                  : 'No receipt image attached for this order'}
            </Typography>
            {receiptUrl && imgError && (
              <Button
                component="a"
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
              >
                {isRtl ? 'محاولة فتح الرابط مباشرة' : 'Try opening link directly'}
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

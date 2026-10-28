'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { useLocale, useTranslations } from 'next-intl';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment, headCellType } from 'src/components/SharedTable/types';
import Iconify from 'src/components/iconify';
import { InstructorTransferItem } from 'src/types/instructor-wallet';
import { resolveReceiptUrl } from 'src/types/order';

export type FormattedTransferRow = InstructorTransferItem & {
  status?: string;
  receipt?: string;
};

interface Props {
  transactions: InstructorTransferItem[];
  totalCount: number;
  loading?: boolean;
  /** When true, render table only (parent provides Card + tabs header). */
  embedded?: boolean;
}

export default function InstructorMyTransfersTable({
  transactions,
  totalCount,
  loading = false,
  embedded = false,
}: Props) {
  const t = useTranslations('InstructorWallet.transactions');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  // Receipt preview modal state
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenReceipt = (rawUrl: string) => {
    const fullUrl = resolveReceiptUrl(rawUrl);
    setPreviewReceiptUrl(fullUrl);
  };

  const tableHead: headCellType[] = [
    {
      id: 'transferDate',
      label: t('col_date'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'note',
      label: t('col_note'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'bankReferenceNumber',
      label: t('col_bank_reference'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'amount',
      label: t('col_amount'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'status',
      label: t('col_status'),
      align: cellAlignment.center,
    },
    {
      id: 'receipt',
      label: t('col_receipt'),
      align: cellAlignment.center,
    },
  ];

  const customRender = {
    transferDate: (row: FormattedTransferRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
        {formatDate(row.transferDate || row.creationTime)}
      </Typography>
    ),
    note: (row: FormattedTransferRow) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
        {row.note || row.transferNumber || t('status_completed')}
      </Typography>
    ),
    bankReferenceNumber: (row: FormattedTransferRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
        {row.bankReferenceNumber || row.transferNumber || '—'}
      </Typography>
    ),
    amount: (row: FormattedTransferRow) => {
      const currency = row.currencySymbol || row.currencyCode || '';
      return (
        <Typography
          sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}
        >
          <Box component="span" sx={{ direction: 'ltr', display: 'inline-block' }}>
            -{Math.abs(row.amount).toLocaleString()} {currency}
          </Box>
        </Typography>
      );
    },
    status: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Chip
          label={t('status_completed')}
          size="small"
          sx={{
            bgcolor: '#DCFCE7',
            color: '#15803D',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
            px: 0.5,
          }}
        />
      </Box>
    ),
    receipt: (row: FormattedTransferRow) => (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {row.receiptUrl ? (
          <Button
            size="small"
            onClick={() => handleOpenReceipt(row.receiptUrl!)}
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: 13,
              p: 0.5,
              minWidth: 'auto',
              '&:hover': { bgcolor: '#EFF6FF', textDecoration: 'underline' },
            }}
          >
            {t('view_receipt')}
          </Button>
        ) : (
          <Typography sx={{ color: '#94A3B8' }}>—</Typography>
        )}
      </Box>
    ),
  };

  const tableContent = (
    <Box sx={{ px: embedded ? 0 : 1, position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.72)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      <SharedTable<FormattedTransferRow>
        data={transactions}
        tableHead={tableHead}
        customRender={customRender}
        count={totalCount}
        serverPagination
      />
    </Box>
  );

  return (
    <>
      {embedded ? (
        tableContent
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography
              sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', textAlign: 'start' }}
            >
              {t('title')}
            </Typography>
          </Box>
          {tableContent}
        </Card>
      )}

      {/* Receipt Modal Preview */}
      <Dialog
        open={Boolean(previewReceiptUrl)}
        onClose={() => setPreviewReceiptUrl(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
            {t('col_receipt')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {previewReceiptUrl && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.open(previewReceiptUrl, '_blank')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.6,
                }}
              >
                <Iconify icon="solar:square-top-down-linear" width={18} />
                <span>{locale === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new tab'}</span>
              </Button>
            )}
            <IconButton onClick={() => setPreviewReceiptUrl(null)} size="small">
              <Iconify icon="solar:close-circle-bold" width={22} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          {previewReceiptUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewReceiptUrl}
              alt="Receipt Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 8,
                margin: '0 auto',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

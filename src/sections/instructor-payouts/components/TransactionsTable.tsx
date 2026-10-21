'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import TablePagination from '@mui/material/TablePagination';
import { useLocale, useTranslations } from 'next-intl';
import { InstructorTransferItem } from 'src/types/instructor-payout';

interface Props {
  transactions: InstructorTransferItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

export default function TransactionsTable({
  transactions,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
  onViewReceipt,
}: Props) {
  const t = useTranslations('InstructorPayouts.details.transactions');
  const locale = useLocale();

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

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Title Bar */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
        <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', textAlign: 'start' }}>
          {t('title')}
        </Typography>
      </Box>

      {/* Table Content */}
      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 750,
            tableLayout: 'fixed',
          }}
        >
          {/* Table Header */}
          <Box component="thead">
            <Box
              component="tr"
              sx={{
                bgcolor: '#F8FAFC',
                '& th': {
                  p: 2,
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'start',
                  borderBottom: '1px solid #F1F5F9',
                },
              }}
            >
              <Box component="th" sx={{ width: '16%' }}>
                {t('col_date')}
              </Box>
              <Box component="th" sx={{ width: '25%' }}>
                {t('col_note')}
              </Box>
              <Box component="th" sx={{ width: '23%' }}>
                {t('col_reference')}
              </Box>
              <Box component="th" sx={{ width: '14%' }}>
                {t('col_amount')}
              </Box>
              <Box component="th" sx={{ width: '11%', textAlign: 'center !important' }}>
                {t('col_status')}
              </Box>
              <Box component="th" sx={{ width: '11%', textAlign: 'center !important' }}>
                {t('col_receipt')}
              </Box>
            </Box>
          </Box>

          {/* Table Body */}
          <Box component="tbody">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Box
                  component="tr"
                  key={`skeleton-${idx}`}
                  sx={{
                    borderBottom: '1px solid #F1F5F9',
                    '& td': { p: 2 },
                  }}
                >
                  <Box component="td">
                    <Skeleton width={80} height={20} />
                  </Box>
                  <Box component="td">
                    <Skeleton width={180} height={20} />
                  </Box>
                  <Box component="td">
                    <Skeleton width={120} height={20} />
                  </Box>
                  <Box component="td">
                    <Skeleton width={90} height={20} />
                  </Box>
                  <Box component="td" sx={{ textAlign: 'center' }}>
                    <Skeleton width={60} height={24} sx={{ mx: 'auto' }} />
                  </Box>
                  <Box component="td" sx={{ textAlign: 'center' }}>
                    <Skeleton width={70} height={20} sx={{ mx: 'auto' }} />
                  </Box>
                </Box>
              ))
            ) : transactions.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ color: '#64748B', fontSize: 14, fontWeight: 600 }}>
                    {t('no_transactions')}
                  </Typography>
                </Box>
              </Box>
            ) : (
              transactions.map((tx) => {
                const currency = tx.currencySymbol || tx.currencyCode || '';
                const displayNote = tx.note || tx.transferNumber || t('status_completed');
                const displayRef = tx.bankReferenceNumber || tx.transferNumber || '—';

                return (
                  <Box
                    component="tr"
                    key={tx.id}
                    sx={{
                      borderBottom: '1px solid #F1F5F9',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { p: 2, fontSize: 13.5, textAlign: 'start' },
                    }}
                  >
                    {/* 1. Date */}
                    <Box component="td" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatDate(tx.transferDate || tx.creationTime)}
                    </Box>

                    {/* 2. Note */}
                    <Box component="td" sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {displayNote}
                    </Box>

                    {/* 3. Reference */}
                    <Box
                      component="td"
                      sx={{
                        color: '#64748B',
                        fontFamily: displayRef !== '—' ? 'monospace' : 'inherit',
                      }}
                    >
                      {displayRef}
                    </Box>

                    {/* 4. Amount */}
                    <Box
                      component="td"
                      sx={{
                        fontWeight: 800,
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box component="span" sx={{ direction: 'ltr', display: 'inline-block' }}>
                        -{Math.abs(tx.amount).toLocaleString()} {currency}
                      </Box>
                    </Box>

                    {/* 5. Status Badge */}
                    <Box component="td" sx={{ textAlign: 'center !important' }}>
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

                    {/* 6. Receipt Link */}
                    <Box component="td" sx={{ textAlign: 'center !important' }}>
                      {tx.receiptUrl ? (
                        <Button
                          size="small"
                          onClick={() => onViewReceipt(tx.receiptUrl!)}
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
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Pagination Footer */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          onRowsPerPageChange(parseInt(e.target.value, 10));
          onPageChange(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage={t('rows_per_page')}
        labelDisplayedRows={({ from, to, count: total }) =>
          locale === 'ar'
            ? `${total === 0 ? '0-0' : `${from}-${to}`} من ${total}`
            : `${total === 0 ? '0-0' : `${from}-${to}`} of ${total}`
        }
        sx={{
          borderTop: '1px solid #F1F5F9',
          '& .MuiTablePagination-toolbar': {
            minHeight: 52,
            px: 2.5,
          },
        }}
      />
    </Card>
  );
}

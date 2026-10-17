'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useTranslations, useLocale } from 'next-intl';
import Iconify from 'src/components/iconify';
import { SessionRequestTransactionResult } from 'src/types/private-request';

interface Props {
  requestId: string;
  transactions?: SessionRequestTransactionResult[];
  currency?: string;
  loading?: boolean;
}

export default function FinancialTransactionsTable({
  requestId,
  transactions = [],
  currency = '',
  loading = false,
}: Props) {
  const t = useTranslations('PrivateRequests.details.transactions_table');
  const locale = useLocale();
  const displayId = requestId.length > 12 ? `${requestId.slice(0, 8)}...` : requestId;

  // Format date and time
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalHours = transactions.reduce((acc, tItem) => acc + (Number(tItem.hours) || 0), 0);
  const totalAmount = transactions.reduce((acc, tItem) => acc + (Number(tItem.totalAmount) || 0), 0);
  const totalInstructorEarnings = transactions.reduce(
    (acc, tItem) => acc + (Number(tItem.instructorAmount) || 0),
    0
  );

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Table Header Row: Title & Icon on RIGHT (First in RTL), Count Chip on LEFT (Second in RTL) */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:bill-list-bold" width={22} sx={{ color: '#0D9488' }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, color: '#0F172A' }}>
            {t('title', { id: displayId })}
          </Typography>
        </Stack>

        <Chip
          label={t('records_count', { count: transactions.length })}
          size="small"
          sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 12 }}
        />
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ p: 2.5 }}>
          <Skeleton variant="rounded" width="100%" height={50} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" width="100%" height={45} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="100%" height={45} />
        </Box>
      ) : transactions.length === 0 ? (
        /* Empty State */
        <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
          <Iconify icon="solar:bill-cross-linear" width={42} sx={{ color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: '#334155' }}>
            {t('empty_title')}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#94A3B8', mt: 0.5 }}>
            {t('empty_desc')}
          </Typography>
        </Box>
      ) : (
        /* Table Container */
        <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 800,
              textAlign: 'center',
            }}
          >
            {/* thead */}
            <Box component="thead">
              <Box
                component="tr"
                sx={{
                  bgcolor: '#F8FAFC',
                  '& th': {
                    p: 1.75,
                    color: '#64748B',
                    fontSize: 12.5,
                    fontWeight: 700,
                    borderBottom: '1px solid #F1F5F9',
                  },
                }}
              >
                <Box component="th">{t('cols.tx_id')}</Box>
                <Box component="th" sx={{ textAlign: 'start !important', pr: 3 }}>
                  {t('cols.description')}
                </Box>
                <Box component="th">{t('cols.datetime')}</Box>
                <Box component="th">{t('cols.executed_hours')}</Box>
                <Box component="th">{t('cols.price_per_hour')}</Box>
                <Box component="th">{t('cols.total_value')}</Box>
                <Box component="th">{t('cols.instructor_net')}</Box>
              </Box>
            </Box>

            {/* tbody */}
            <Box component="tbody">
              {transactions.map((tx) => {
                const rowCurrency = tx.currencySymbol || tx.currencyCode || currency;
                return (
                  <Box
                    component="tr"
                    key={tx.id}
                    sx={{
                      borderBottom: '1px solid #F1F5F9',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { p: 2, fontSize: 13 },
                    }}
                  >
                    {/* Transaction Number */}
                    <Box component="td" sx={{ fontWeight: 700, color: '#475569' }}>
                      {tx.transactionNumber || `#${tx.id.slice(0, 8)}`}
                    </Box>

                    {/* Chapter Title */}
                    <Box component="td" sx={{ textAlign: 'start !important', pr: 3 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                        {tx.chapterTitle || '—'}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Box component="td" sx={{ color: '#64748B', fontSize: 12.5 }}>
                      {formatDateTime(tx.creationTime)}
                    </Box>

                    {/* Hours */}
                    <Box component="td" sx={{ color: '#DC2626', fontWeight: 800 }}>
                      {t('summary.hours', { hours: Number(tx.hours || 0).toFixed(2) })}
                    </Box>

                    {/* Price Per Hour */}
                    <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>
                      {Number(tx.pricePerHour || 0).toFixed(2)} {rowCurrency}
                    </Box>

                    {/* Total Amount */}
                    <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                      {Number(tx.totalAmount || 0).toFixed(2)} {rowCurrency}
                    </Box>

                    {/* Instructor Earnings */}
                    <Box component="td" sx={{ color: '#059669', fontWeight: 800, fontSize: 13.5 }}>
                      +{Number(tx.instructorAmount || 0).toFixed(2)} {rowCurrency}
                    </Box>
                  </Box>
                );
              })}

              {/* Summary Cumulative Row */}
              <Box
                component="tr"
                sx={{
                  bgcolor: '#F8FAFC',
                  borderTop: '2px solid #E2E8F0',
                  '& td': { p: 2.25, fontSize: 13.5, fontWeight: 800 },
                }}
              >
                <Box
                  component="td"
                  colSpan={3}
                  sx={{ textAlign: 'start !important', pr: 3, color: '#0F172A' }}
                >
                  {t('summary.cumulative')}
                </Box>

                <Box component="td" sx={{ color: '#DC2626' }}>
                  {t('summary.hours', { hours: totalHours.toFixed(2) })}
                </Box>

                <Box component="td" sx={{ color: '#94A3B8' }}>
                  —
                </Box>

                <Box component="td" sx={{ color: '#0F172A' }}>
                  {totalAmount.toFixed(2)} {currency}
                </Box>

                <Box component="td" sx={{ color: '#059669', fontSize: 14.5 }}>
                  +{totalInstructorEarnings.toFixed(2)} {currency}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}

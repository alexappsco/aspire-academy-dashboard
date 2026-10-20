'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { PayoutTransaction, PayoutTransactionStatus } from 'src/types/instructor-payout';

interface Props {
  transactions: PayoutTransaction[];
  onViewReceipt: (transaction: PayoutTransaction) => void;
}

export default function TransactionsTable({
  transactions,
  onViewReceipt,
}: Props) {
  const t = useTranslations('InstructorPayouts.details.transactions');
  const locale = useLocale();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const totalCount = transactions.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    return transactions.slice(start, start + rowsPerPage);
  }, [transactions, page, rowsPerPage]);

  const startItem = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, totalCount);

  const getStatusChip = (status: PayoutTransactionStatus) => {
    switch (status) {
      case 'completed':
        return (
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
        );
      case 'pending':
        return (
          <Chip
            label={t('status_pending')}
            size="small"
            sx={{
              bgcolor: '#FEF3C7',
              color: '#B45309',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              borderRadius: 1.5,
              px: 0.5,
            }}
          />
        );
      case 'under_review':
        return (
          <Chip
            label={t('status_under_review')}
            size="small"
            sx={{
              bgcolor: '#F1F5F9',
              color: '#475569',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              borderRadius: 1.5,
              px: 0.5,
            }}
          />
        );
      case 'settled':
        return (
          <Chip
            label={t('status_settled')}
            size="small"
            sx={{
              bgcolor: '#F3E8FF',
              color: '#9333EA',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              borderRadius: 1.5,
              px: 0.5,
            }}
          />
        );
      default:
        return null;
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
      {/* Title Bar (Without filters/tabs) */}
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
            minWidth: 700,
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
              <Box component="th" sx={{ width: 130 }}>
                {t('col_date')}
              </Box>
              <Box component="th">{t('col_note')}</Box>
              <Box component="th" sx={{ width: 170 }}>
                {t('col_reference')}
              </Box>
              <Box component="th" sx={{ width: 140 }}>
                {t('col_amount')}
              </Box>
              <Box component="th" sx={{ width: 130, textAlign: 'center !important' }}>
                {t('col_status')}
              </Box>
              <Box component="th" sx={{ width: 120, textAlign: 'center !important' }}>
                {t('col_receipt')}
              </Box>
            </Box>
          </Box>

          {/* Table Body */}
          <Box component="tbody">
            {paginatedTransactions.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ color: '#64748B', fontSize: 14, fontWeight: 600 }}>
                    {t('no_transactions')}
                  </Typography>
                </Box>
              </Box>
            ) : (
              paginatedTransactions.map((tx) => {
                const isNegative = tx.amount < 0;
                const formattedAmount = `${isNegative ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()} ${tx.currency}`;

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
                      {tx.date}
                    </Box>

                    {/* 2. Note */}
                    <Box component="td" sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {tx.note}
                    </Box>

                    {/* 3. Reference */}
                    <Box
                      component="td"
                      sx={{
                        color: '#64748B',
                        fontFamily: tx.reference !== '—' ? 'monospace' : 'inherit',
                      }}
                    >
                      {tx.reference}
                    </Box>

                    {/* 4. Amount */}
                    <Box
                      component="td"
                      sx={{
                        fontWeight: 800,
                        color: isNegative ? '#0F172A' : '#15803D',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box component="span" sx={{ direction: 'ltr', display: 'inline-block' }}>
                        {formattedAmount}
                      </Box>
                    </Box>

                    {/* 5. Status Badge */}
                    <Box component="td" sx={{ textAlign: 'center !important' }}>
                      {getStatusChip(tx.status)}
                    </Box>

                    {/* 6. Receipt Link */}
                    <Box component="td" sx={{ textAlign: 'center !important' }}>
                      {tx.receiptUrl ? (
                        <Button
                          size="small"
                          onClick={() => onViewReceipt(tx)}
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
      <Stack
        direction="row"
        spacing={2}
        sx={{
          p: 2,
          px: 2.5,
          borderTop: '1px solid #F1F5F9',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 13, color: '#64748B' }}>
          {startItem}-{endItem} of {totalCount}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            sx={{
              height: 32,
              fontSize: 13,
              borderRadius: 1.5,
              '& .MuiSelect-select': { py: 0.5, px: 1.25 },
            }}
          >
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>{t('rows_per_page')}</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ ms: 'auto', gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            sx={{ borderRadius: 1.5 }}
          >
            <Iconify
              icon={locale === 'ar' ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'}
              width={18}
            />
          </IconButton>
          <IconButton
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            sx={{ borderRadius: 1.5 }}
          >
            <Iconify
              icon={locale === 'ar' ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'}
              width={18}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
}

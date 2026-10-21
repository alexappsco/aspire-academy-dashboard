'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocale, useTranslations } from 'next-intl';
import { InstructorDueItem } from 'src/types/instructor-payout';
import { paths } from 'src/routes/paths';

interface Props {
  items: InstructorDueItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
}

export default function PayoutTable({
  items,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const t = useTranslations('InstructorPayouts.table');
  const locale = useLocale();

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
      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 800,
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
              <Box component="th" sx={{ minWidth: 180 }}>
                {t('col_instructor')}
              </Box>
              <Box component="th">{t('col_country')}</Box>
              <Box component="th">{t('col_university')}</Box>
              <Box component="th">{t('col_total_earnings')}</Box>
              <Box component="th">{t('col_transferred')}</Box>
              <Box component="th">{t('col_due_now')}</Box>
              <Box component="th">{t('col_last_transfer')}</Box>
              <Box component="th" sx={{ minWidth: 120, whiteSpace: 'nowrap', textAlign: 'center !important' }}>
                {t('col_record')}
              </Box>
            </Box>
          </Box>

          {/* Table Body */}
          <Box component="tbody">
            {loading ? (
              <Box component="tr">
                <Box component="td" colSpan={8} sx={{ py: 8, textAlign: 'center' }}>
                  <CircularProgress size={32} sx={{ color: '#0F172A' }} />
                </Box>
              </Box>
            ) : items.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={8} sx={{ py: 8, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#64748B' }}>
                    {t('no_data')}
                  </Typography>
                </Box>
              </Box>
            ) : (
              items.map((row) => {
                const currency = row.currencySymbol || row.currencyCode || '';
                const formattedDate = row.lastTransferDate
                  ? new Date(row.lastTransferDate).toLocaleDateString('en-GB')
                  : '—';

                return (
                  <Box
                    component="tr"
                    key={row.instructorId}
                    sx={{
                      borderBottom: '1px solid #F1F5F9',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { p: 2, fontSize: 13.5, textAlign: 'start' },
                    }}
                  >
                    {/* 1. Instructor Name */}
                    <Box component="td" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {row.instructorName}
                    </Box>

                    {/* 2. Country */}
                    <Box component="td" sx={{ color: '#475569' }}>
                      {row.countryName || '—'}
                    </Box>

                    {/* 3. University */}
                    <Box component="td" sx={{ color: '#475569' }}>
                      {row.universityName || '—'}
                    </Box>

                    {/* 4. Total Earnings */}
                    <Box component="td" sx={{ color: '#334155', fontWeight: 600 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box component="span">{row.totalProfits.toLocaleString()}</Box>
                        {currency && (
                          <Box component="span" sx={{ color: '#64748B', fontSize: '0.85em', fontWeight: 500 }}>
                            {currency}
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* 5. Transferred */}
                    <Box component="td" sx={{ color: '#334155', fontWeight: 600 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box component="span">{row.transferredThisPeriod.toLocaleString()}</Box>
                        {currency && (
                          <Box component="span" sx={{ color: '#64748B', fontSize: '0.85em', fontWeight: 500 }}>
                            {currency}
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* 6. Due Now */}
                    <Box
                      component="td"
                      sx={{
                        fontWeight: 800,
                        color: row.dueNow > 0 ? '#0F172A' : '#64748B',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box component="span">{row.dueNow.toLocaleString()}</Box>
                        {currency && (
                          <Box component="span" sx={{ color: '#64748B', fontSize: '0.85em', fontWeight: 500 }}>
                            {currency}
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* 7. Last Transfer Date */}
                    <Box component="td" sx={{ color: '#64748B' }}>
                      {formattedDate}
                    </Box>

                    {/* 8. Record Link */}
                    <Box component="td" sx={{ minWidth: 120, whiteSpace: 'nowrap', textAlign: 'center !important' }}>
                      <Button
                        component={Link}
                        href={paths.instructorPayouts.details(row.instructorId)}
                        size="small"
                        sx={{
                          color: '#2563EB',
                          fontWeight: 700,
                          fontSize: 13,
                          px: 1.5,
                          py: 0.5,
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          '&:hover': { bgcolor: '#EFF6FF', textDecoration: 'underline' },
                        }}
                      >
                        {t('view_record')}
                      </Button>
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
        rowsPerPageOptions={[8, 15, 25]}
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

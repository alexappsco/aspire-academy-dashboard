'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { InstructorPayoutItem } from 'src/types/instructor-payout';
import { paths } from 'src/routes/paths';

interface Props {
  items: InstructorPayoutItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
}

export default function PayoutTable({
  items,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const t = useTranslations('InstructorPayouts.table');
  const locale = useLocale();

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startItem = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, totalCount);

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
              <Box component="th" sx={{ width: 100, textAlign: 'center !important' }}>
                {t('col_record')}
              </Box>
            </Box>
          </Box>

          {/* Table Body */}
          <Box component="tbody">
            {items.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={8} sx={{ py: 8, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#64748B' }}>
                    {t('no_data')}
                  </Typography>
                </Box>
              </Box>
            ) : (
              items.map((row) => (
                <Box
                  component="tr"
                  key={row.id}
                  sx={{
                    borderBottom: '1px solid #F1F5F9',
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': { p: 2, fontSize: 13.5, textAlign: 'start' },
                  }}
                >
                  {/* 1. Instructor Name */}
                  <Box component="td" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {row.name}
                  </Box>

                  {/* 2. Country */}
                  <Box component="td" sx={{ color: '#475569' }}>
                    {row.country}
                  </Box>

                  {/* 3. University */}
                  <Box component="td" sx={{ color: '#475569' }}>
                    {row.university}
                  </Box>

                  {/* 4. Total Earnings */}
                  <Box component="td" sx={{ color: '#334155', fontWeight: 600 }}>
                    {row.totalEarnings.toLocaleString()} {row.currency}
                  </Box>

                  {/* 5. Transferred */}
                  <Box component="td" sx={{ color: '#334155', fontWeight: 600 }}>
                    {row.totalTransferred.toLocaleString()} {row.currency}
                  </Box>

                  {/* 6. Due Now */}
                  <Box
                    component="td"
                    sx={{
                      fontWeight: 800,
                      color: row.dueNow > 0 ? '#0F172A' : '#64748B',
                    }}
                  >
                    {row.dueNow.toLocaleString()} {row.currency}
                  </Box>

                  {/* 7. Last Transfer Date */}
                  <Box component="td" sx={{ color: '#64748B' }}>
                    {row.lastTransferDate || '—'}
                  </Box>

                  {/* 8. Record Link */}
                  <Box component="td" sx={{ textAlign: 'center !important' }}>
                    <Button
                      component={Link}
                      href={paths.instructorPayouts.details(row.id)}
                      size="small"
                      sx={{
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: 13,
                        p: 0.5,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: '#EFF6FF', textDecoration: 'underline' },
                      }}
                    >
                      {t('view_record')}
                    </Button>
                  </Box>
                </Box>
              ))
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
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
            }}
            sx={{
              height: 32,
              fontSize: 13,
              borderRadius: 1.5,
              '& .MuiSelect-select': { py: 0.5, px: 1.25 },
            }}
          >
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>{t('rows_per_page')}</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ ms: 'auto', gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
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
            onClick={() => onPageChange(page + 1)}
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

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import type { FinancialTransaction, TransactionStatus } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';
const BLUE = '#0052CC';

type TabKey = 'all' | TransactionStatus;

interface Props {
  transactions: FinancialTransaction[];
  totalTransactions: number;
}

function statusMeta(status: TransactionStatus, t: (key: string) => string): { label: string; color: string; bg: string } {
  if (status === 'pending') {
    return { label: t('status_pending'), color: '#B45309', bg: '#FEF3C7' };
  }
  if (status === 'refunded') {
    return { label: t('status_refunded'), color: '#B91C1C', bg: '#FEE2E2' };
  }
  return { label: t('status_paid'), color: '#047857', bg: '#D1FAE5' };
}

export default function FinancialTransactionsTable({ transactions, totalTransactions }: Props) {
  const t = useTranslations('InstructorAnalytics.transactions');

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [rowsLimit, setRowsLimit] = useState(5);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: t('tabs.all') },
    { key: 'paid', label: t('tabs.paid') },
    { key: 'pending', label: t('tabs.pending') },
    { key: 'refunded', label: t('tabs.refunded') },
  ];

  const filtered =
    activeTab === 'all' ? transactions : transactions.filter((tx) => tx.status === activeTab);

  const visibleRows = filtered.slice(0, rowsLimit);

  const tableHeaderSx = {
    bgcolor: '#F8FAFC',
    py: 1.25,
    px: 1.5,
    borderBottom: `1px solid ${CARD_BORDER}`,
  };

  const tableCellSx = {
    py: 1.5,
    px: 1.5,
    borderBottom: '1px solid #F1F5F9',
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        mb: 2.5,
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11, mt: 0.25 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {tabs.map((tab) => (
            <Chip
              key={tab.key}
              label={tab.label}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                bgcolor: activeTab === tab.key ? '#E6F7F2' : '#F8FAFC',
                color: activeTab === tab.key ? PRIMARY : '#64748B',
                border: activeTab === tab.key ? `1px solid ${PRIMARY}` : `1px solid ${CARD_BORDER}`,
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: 11.5,
                height: 28,
                borderRadius: 1.5,
                '&:hover': { bgcolor: activeTab === tab.key ? '#E6F7F2' : '#F1F5F9' },
              }}
            />
          ))}
        </Box>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
          <Box component="thead">
            <Box component="tr">
              {[
                t('columns.date'),
                t('columns.description'),
                t('columns.type'),
                t('columns.total'),
                t('columns.instructor'),
                t('columns.platform'),
                t('columns.status'),
              ].map((col) => (
                <Box
                  key={col}
                  component="th"
                  sx={{
                    ...tableHeaderSx,
                    textAlign: 'right',
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: '#94A3B8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {visibleRows.length > 0 ? (
              visibleRows.map((tx) => {
                const status = statusMeta(tx.status, t);
                return (
                  <Box component="tr" key={tx.id}>
                    <Box component="td" sx={{ ...tableCellSx, whiteSpace: 'nowrap' }}>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>{tx.dateTime}</Typography>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', mb: 0.25 }}>
                        {tx.description}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{tx.student}</Typography>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx }}>
                      <Chip
                        label={tx.type === 'course' ? t('type_course') : t('type_lesson')}
                        size="small"
                        sx={{
                          bgcolor: tx.type === 'course' ? '#EEF2FF' : '#F1F5F9',
                          color: tx.type === 'course' ? BLUE : '#475569',
                          fontWeight: 600,
                          fontSize: 10.5,
                          height: 22,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                      ${tx.totalAmount.toFixed(2)}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12.5, fontWeight: 700, color: PRIMARY, whiteSpace: 'nowrap' }}>
                      ${tx.instructorShare.toFixed(2)}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12.5, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                      ${tx.platformShare.toFixed(2)}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx }}>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: 10.5, height: 22, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box component="td" colSpan={7} sx={{ py: 5, textAlign: 'center' }}>
                  <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>{t('empty')}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {filtered.length > rowsLimit && (
        <Box sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${CARD_BORDER}`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
            {t('more_rows', { count: String(filtered.length - rowsLimit) })}
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, borderTop: `1px solid ${CARD_BORDER}` }}
      >
        <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>
          {t('pagination', { from: '1', to: String(visibleRows.length), total: String(activeTab === 'all' ? totalTransactions : filtered.length) })}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => setRowsLimit((prev) => Math.max(5, prev - 5))}
            sx={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 1.5, color: '#64748B' }}
          >
            <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setRowsLimit((prev) => Math.min(filtered.length, prev + 5))}
            sx={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 1.5, color: '#64748B' }}
          >
            <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
}
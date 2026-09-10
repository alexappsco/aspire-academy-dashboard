'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import type { ReceiptFinancials, WeeklyCollection } from 'src/types/reports';

const PRIMARY = '#00A980';
const ORANGE = '#FF9F1C';
const RED = '#E63946';
const CARD_BORDER = '#E0E0E0';

interface Props {
  receiptFinancials?: ReceiptFinancials;
  weeklyCollections?: WeeklyCollection[];
}

export default function FinancialSummary({ receiptFinancials, weeklyCollections }: Props) {
  const t = useTranslations('Reports.financial');
  const hasFinancials = receiptFinancials !== undefined;
  const hasWeekly = weeklyCollections !== undefined && weeklyCollections.length > 0;

  const maxAmount = hasWeekly ? Math.max(...weeklyCollections.map((d) => d.amount), 1) : 1;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mb: 2.5,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {/* 4-Column Layout */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {/* Column 1: Total Requests */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#F8F9FA',
              border: `1px solid ${CARD_BORDER}`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', mb: 0.75 }}>
              {t('total_requests')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 22, mb: 0.5 }}>
              {hasFinancials ? receiptFinancials.totalOrders.toLocaleString() : '—'}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
              {hasFinancials
                ? `${receiptFinancials.approvedOrders.toLocaleString()} مقبولة • ${receiptFinancials.pendingOrders.toLocaleString()} مراجعة • ${receiptFinancials.rejectedOrders.toLocaleString()} مرفوضة`
                : '—'}
            </Typography>
          </Box>
        </Grid>

        {/* Column 2: Accepted Amount */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#E6F7F2',
              border: `1px solid ${PRIMARY}33`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', mb: 0.5 }}>
              {t('accepted_amount')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: 18, mb: 0.25 }}>
              {hasFinancials ? receiptFinancials.approvedAmount.toLocaleString() : '—'} {t('currency')}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: '#6B7280' }}>{t('accepted_sub')}</Typography>
          </Box>
        </Grid>

        {/* Column 3: Under Review (Orange) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFF8E1',
              border: `1px solid ${ORANGE}33`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', mb: 0.5 }}>
              {t('review_amount')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: ORANGE, fontSize: 18, mb: 0.25 }}>
              {hasFinancials ? receiptFinancials.pendingAmount.toLocaleString() : '—'} {t('currency')}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: '#6B7280' }}>{t('review_sub', { count: String(hasFinancials ? receiptFinancials.pendingReceiptsCount : 0) })}</Typography>
          </Box>
        </Grid>

        {/* Column 4: Rejected (Red) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FDECEA',
              border: `1px solid ${RED}33`,
              height: '100%',
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', mb: 0.5 }}>
              {t('rejected_amount')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: RED, fontSize: 18, mb: 0.25 }}>
              {hasFinancials ? receiptFinancials.rejectedAmount.toLocaleString() : '—'} {t('currency')}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: '#6B7280' }}>{t('rejected_sub')}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Weekly Bars Sub-section */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: '#F8F9FA',
          border: `1px solid ${CARD_BORDER}`,
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
            {t('weekly_collections')}
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>
            {hasFinancials ? receiptFinancials.verificationAccuracy : 0}% {t('accuracy')}
          </Typography>
        </Stack>

        <Grid container spacing={1.5}>
          {hasWeekly
            ? weeklyCollections.map((item) => (
                <Grid key={item.weekNumber} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.375 }}>
                    <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>
                      الأسبوع {item.weekNumber}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600 }}>
                      {item.amount.toLocaleString()} {t('currency')}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#E0E0E0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: PRIMARY,
                        opacity: item.isCurrentWeek ? 1 : 0.55,
                      },
                    }}
                  />
                </Grid>
              ))
            : [1, 2, 3, 4].map((w) => (
                <Grid key={w} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.375 }}>
                    <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>
                      الأسبوع {w}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600 }}>0 {t('currency')}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#E0E0E0',
                      '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: PRIMARY },
                    }}
                  />
                </Grid>
              ))}
        </Grid>
      </Box>
    </Card>
  );
}

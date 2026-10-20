'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { InstructorPayoutsSummary } from 'src/types/instructor-payout';

interface Props {
  summary: InstructorPayoutsSummary;
}

export default function PayoutKpiCards({ summary }: Props) {
  const t = useTranslations('InstructorPayouts.kpi');

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {/* 1. Due Now Total Card (Dark Blue / Slate) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'start',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, mb: 1 }}>
            {t('due_now_title')}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75, direction: 'ltr', mb: 0.5 }}>
            <Typography component="span" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: '#FFFFFF' }}>
              {summary.dueNowTotal.toLocaleString()}
            </Typography>
            <Typography component="span" sx={{ fontSize: { xs: 16, md: 20 }, fontWeight: 700, color: '#FFFFFF' }}>
              {summary.currency}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12.5, color: '#94A3B8' }}>
            {t('instructors_waiting', { count: summary.instructorsWaitingCount })}
          </Typography>
        </Card>
      </Grid>

      {/* 2. Transferred This Month Card (White) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'start',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600, mb: 1 }}>
            {t('transferred_month_title')}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75, direction: 'ltr', mb: 0.5 }}>
            <Typography component="span" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: '#0F172A' }}>
              {summary.transferredThisMonthTotal.toLocaleString()}
            </Typography>
            <Typography component="span" sx={{ fontSize: { xs: 16, md: 20 }, fontWeight: 700, color: '#0F172A' }}>
              {summary.currency}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
            {t('transfers_recorded', { count: summary.transfersCountThisMonth })}
          </Typography>
        </Card>
      </Grid>

      {/* 3. Missing Bank Data Card (White with Warning styling) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'start',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600, mb: 1 }}>
            {t('missing_bank_data_title')}
          </Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
            {t('missing_bank_count', { count: summary.missingBankDataCount })}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#DC2626', fontWeight: 600 }}>
            {t('missing_bank_helper')}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
}

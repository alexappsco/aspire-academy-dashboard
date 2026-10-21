'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { InstructorDueDetailsResponse } from 'src/types/instructor-payout';

interface Props {
  instructor: InstructorDueDetailsResponse;
}

export default function InstructorBalanceCard({ instructor }: Props) {
  const t = useTranslations('InstructorPayouts.details.balance_card');

  const {
    totalProfits = 0,
    totalTransferred = 0,
    dueNow = 0,
    transferredPercent,
    currencySymbol,
    currencyCode,
  } = instructor;

  const currency = currencySymbol || currencyCode || '';
  const progressPercent =
    typeof transferredPercent === 'number'
      ? Math.min(Math.round(transferredPercent), 100)
      : totalProfits > 0
        ? Math.min(Math.round((totalTransferred / totalProfits) * 100), 100)
        : 0;

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'start',
      }}
    >
      <Box>
        {/* Title */}
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A', mb: 2 }}>
          {t('title')}
        </Typography>

        {/* Due Now Label & Big Amount */}
        <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600, mb: 0.5, textAlign: 'start' }}>
          {t('due_now_label')}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 32, md: 40 },
            fontWeight: 900,
            color: '#0F172A',
            mb: 2,
            textAlign: 'start',
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
            <Box component="span">{dueNow.toLocaleString()}</Box>
            {currency && (
              <Box component="span" sx={{ fontSize: '0.6em', color: '#64748B', fontWeight: 700 }}>
                {currency}
              </Box>
            )}
          </Stack>
        </Typography>

        {/* Progress Bar & Percent Label */}
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 7,
            borderRadius: 4,
            bgcolor: '#F1F5F9',
            mb: 1.5,
            '& .MuiLinearProgress-bar': {
              bgcolor: '#10B981',
              borderRadius: 4,
            },
          }}
        />
        <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, mb: 3 }}>
          {t('progress_caption', { percent: progressPercent })}
        </Typography>
      </Box>

      {/* Details breakdown */}
      <Stack spacing={1.25} sx={{ borderTop: '1px solid #F1F5F9', pt: 2 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            {t('total_earnings')}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0.5,
              whiteSpace: 'nowrap',
              fontWeight: 800,
              fontSize: 14,
              color: '#0F172A',
            }}
          >
            <Box component="span">{totalProfits.toLocaleString()}</Box>
            {currency && (
              <Box component="span" sx={{ fontSize: '0.85em', color: '#64748B', fontWeight: 500 }}>
                {currency}
              </Box>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            {t('transferred')}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0.5,
              whiteSpace: 'nowrap',
              fontWeight: 800,
              fontSize: 14,
              color: '#0F172A',
            }}
          >
            <Box component="span">{totalTransferred.toLocaleString()}</Box>
            {currency && (
              <Box component="span" sx={{ fontSize: '0.85em', color: '#64748B', fontWeight: 500 }}>
                {currency}
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

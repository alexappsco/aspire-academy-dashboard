'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { InstructorPayoutItem } from 'src/types/instructor-payout';

interface Props {
  instructor: InstructorPayoutItem;
}

export default function InstructorBalanceCard({ instructor }: Props) {
  const t = useTranslations('InstructorPayouts.details.balance_card');

  const { totalEarnings, totalTransferred, dueNow, currency, underReviewAmount = 0 } = instructor;
  const progressPercent =
    totalEarnings > 0 ? Math.min(Math.round((totalTransferred / totalEarnings) * 100), 100) : 0;

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
          <Box component="span" sx={{ direction: 'ltr', display: 'inline-block' }}>
            {dueNow.toLocaleString()} {currency}
          </Box>
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
          <Typography sx={{ fontSize: 14, color: '#0F172A', fontWeight: 800, direction: 'ltr', display: 'inline-block' }}>
            {totalEarnings.toLocaleString()} {currency}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            {t('transferred')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#0F172A', fontWeight: 800, direction: 'ltr', display: 'inline-block' }}>
            {totalTransferred.toLocaleString()} {currency}
          </Typography>
        </Stack>

        {underReviewAmount > 0 && (
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              {t('under_review')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#D97706', fontWeight: 800, direction: 'ltr', display: 'inline-block' }}>
              {underReviewAmount.toLocaleString()} {currency}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

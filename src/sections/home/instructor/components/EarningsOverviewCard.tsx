'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import type { EarningsBreakdown } from '../types';

interface Props {
  earnings: EarningsBreakdown;
  onViewReports?: () => void;
}

export default function EarningsOverviewCard({ earnings, onViewReports }: Props) {
  const t = useTranslations('InstructorHome.earnings');

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        bgcolor: '#FFFFFF',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header */}
      <Box>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.1rem' }}>
              {t('title')}
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', mt: 0.5 }}>
              {t('subtitle')}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box component="img" src="/icons/bank.svg" alt="bank" sx={{ width: 22, height: 22 }} />
          </Box>
        </Stack>

        {/* Revenue Breakdown */}
        <Stack spacing={2} sx={{ my: 3 }}>
          {/* Total achieved revenue */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
              {t('total_sales')}
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C252E' }}>
              ${(earnings?.totalRevenue ?? 0).toLocaleString()}
            </Typography>
          </Stack>

          {/* Instructor share */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#1C252E' }}>
              {t('instructor_share', { percent: earnings?.instructorPercentage ?? 70 })}
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>
              ${(earnings?.instructorShare ?? 0).toLocaleString()}
            </Typography>
          </Stack>

          {/* Platform share */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>
              {t('platform_fee', { percent: earnings?.platformPercentage ?? 30 })}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
              ${(earnings?.platformShare ?? 0).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>

        {/* Progress Bar & Legend */}
        <Box sx={{ mt: 3, mb: 1 }}>
          {/* Legend */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#CBD5E1' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                {t('platform_share', { percent: earnings?.platformPercentage ?? 30 })}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>
                {t('your_share', { percent: earnings?.instructorPercentage ?? 70 })}
              </Typography>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#2563EB' }} />
            </Stack>
          </Stack>

          {/* Progress track */}
          <Box
            sx={{
              height: 12,
              borderRadius: '999px',
              bgcolor: '#E2E8F0',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <Box
              sx={{
                width: `${earnings?.instructorPercentage ?? 70}%`,
                height: '100%',
                bgcolor: '#2563EB',
                borderRadius: '999px',
              }}
            />
          </Box>

          {/* Contract note Caption */}
          <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 1.5, textAlign: 'left' }}>
            {t('contract_note')}
          </Typography>
        </Box>
      </Box>

      {/* Bottom link */}
      <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F8FAFC' }}>
        <Button
          onClick={onViewReports}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
          sx={{
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            minWidth: 'auto',
            gap: 0.75,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {t('view_reports')}
        </Button>
      </Box>
    </Card>
  );
}

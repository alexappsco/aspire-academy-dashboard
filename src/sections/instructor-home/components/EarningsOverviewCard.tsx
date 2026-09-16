'use client';

import React from 'react';
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
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.05rem' }}>
              نظرة عامة على الأرباح
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mt: 0.25 }}>
              توزيع الإيرادات بحسب اتفاقية المشاركة
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              bgcolor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:bank-bold" width={22} />
          </Box>
        </Stack>

        {/* Revenue Breakdown */}
        <Stack spacing={1.75} sx={{ my: 2.5 }}>
          {/* Total revenue */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
              إجمالي الإيرادات المحققة:
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1C252E' }}>
              ${earnings.totalRevenue.toLocaleString()}
            </Typography>
          </Stack>

          {/* Instructor share */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
              حصتك من الأرباح ({earnings.instructorPercentage}%):
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>
              ${earnings.instructorShare.toLocaleString()}
            </Typography>
          </Stack>

          {/* Platform share */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>
              حصة المنصة ({earnings.platformPercentage}%):
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
              ${earnings.platformShare.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>

        {/* Progress Bar & Legend */}
        <Box sx={{ mt: 3, mb: 1 }}>
          {/* Legend */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#E2E8F0' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                المنصة: {earnings.platformPercentage}%
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#2563EB' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>
                حصتك: {earnings.instructorPercentage}%
              </Typography>
            </Stack>
          </Stack>

          {/* Progress track */}
          <Box
            sx={{
              height: 10,
              borderRadius: '999px',
              bgcolor: '#F1F5F9',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <Box
              sx={{
                width: `${earnings.instructorPercentage}%`,
                height: '100%',
                bgcolor: '#2563EB',
                borderRadius: '999px',
              }}
            />
          </Box>

          {/* Caption */}
          <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 1.5, textAlign: 'left' }}>
            مُحدد من قبل الإدارة بناءً على عقد المحاضر الخاص بك
          </Typography>
        </Box>
      </Box>

      {/* Bottom link */}
      <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9' }}>
        <Button
          onClick={onViewReports}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
          sx={{
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            minWidth: 'auto',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          عرض التقارير
        </Button>
      </Box>
    </Card>
  );
}

'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import Iconify from 'src/components/iconify';
import { MOCK_SALES_SUMMARY } from '../_mock';

export default function SalesRevenueCard() {
  const t = useTranslations('Home.sales_revenue');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const data = MOCK_SALES_SUMMARY;

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        mb: 3,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
        }}
      >
        {/* Right in RTL: Icon & Title */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:card-bold" width={22} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}
            >
              {t('title')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}
            >
              {t('subtitle')}
            </Typography>
          </Box>
        </Stack>

        {/* Left in RTL: Payment Gateways Chip */}
        <Chip
          label={t('gateways')}
          size="small"
          sx={{
            bgcolor: '#F8FAFC',
            color: '#64748B',
            fontWeight: 600,
            fontSize: 12,
            border: '1px solid #E2E8F0',
            height: 28,
            borderRadius: 1.5,
          }}
        />
      </Stack>

      {/* Main KPI Grid (Right to Left in RTL) */}
      <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
        {/* 1. Total Revenue (Rightmost) */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            sx={{
              p: 2.25,
              borderRadius: 2.5,
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#15803D', fontSize: 13, fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              {t('total_revenue')}
            </Typography>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', my: 0.5, gap: 0.5 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: '#14532D', fontSize: 28 }}
              >
                {data.totalRevenue}
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#15803D', fontWeight: 700 }}>
                {t('currency')}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>
              {t('revenue_growth')}
            </Typography>
          </Box>
        </Grid>

        {/* 2. Completed Orders */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            sx={{
              p: 2.25,
              borderRadius: 2.5,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              {t('completed_orders')}
            </Typography>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', my: 0.5, gap: 0.5 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26 }}
              >
                {data.completedOrders}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                {t('orders_unit')}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>
              {t('conversion_rate')}
            </Typography>
          </Box>
        </Grid>

        {/* 3. Pending Orders */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            sx={{
              p: 2.25,
              borderRadius: 2.5,
              bgcolor: '#FFFBEB',
              border: '1px solid #FDE68A',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#B45309', fontSize: 13, fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              {t('pending_orders')}
            </Typography>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', my: 0.5, gap: 0.5 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: '#92400E', fontSize: 26 }}
              >
                {data.pendingOrders}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#B45309', fontWeight: 600 }}>
                {t('orders_unit')}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: '#D97706', gap: 0.5 }}>
              <Iconify icon="solar:clock-circle-bold" width={14} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>
                {t('expires_in')}
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* 4. Mini Bars Chart (Leftmost) */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'block',
                mb: 1.5,
                textAlign: 'center',
              }}
            >
              {t('comparison_title')}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: 'center',
                alignItems: 'flex-end',
                height: 65,
                gap: 0.75,
              }}
            >
              {data.monthlyBars.map((bar, idx) => (
                <Stack key={idx} spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 26,
                      height: `${bar.height}px`,
                      bgcolor: bar.fill,
                      borderRadius: 1,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      color: bar.active ? '#0047AB' : '#475569',
                      fontWeight: bar.active ? 800 : 600,
                    }}
                  >
                    {isRtl ? bar.month : bar.monthEn}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

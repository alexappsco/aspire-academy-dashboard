'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

import type { FinancialMetric, RevenueSource } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';
const BLUE = '#0052CC';
const AMBER = '#FF9F1C';

interface Props {
  financials: FinancialMetric;
  revenueSources: RevenueSource[];
}

export default function FinancialRevenueBreakdown({ financials, revenueSources }: Props) {
  const t = useTranslations('InstructorAnalytics.financial');

  const formatAmount = (value: number) => `$${value.toFixed(2)}`;

  const metrics = [
    {
      id: 'gross',
      label: t('gross_revenue'),
      value: formatAmount(financials.grossRevenue),
      color: '#1A1A1A',
      icon: 'solar:wallet-money-bold',
      iconBg: '#ECFDF5',
      iconColor: PRIMARY,
      chip: null,
    },
    {
      id: 'net',
      label: t('net_share', { percent: String(financials.netInstructorPercent) }),
      value: formatAmount(financials.netInstructorShare),
      color: BLUE,
      icon: 'solar:dollar-bold',
      iconBg: '#EEF2FF',
      iconColor: BLUE,
      chip: { label: t('due_chip'), bg: '#D1FAE5', color: '#047857' },
      highlighted: true,
    },
    {
      id: 'platform',
      label: t('platform_share', { percent: String(financials.platformPercent) }),
      value: formatAmount(financials.platformShare),
      color: '#475569',
      icon: 'solar:shop-bold',
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
      chip: null,
    },
    {
      id: 'pending',
      label: t('pending_payouts'),
      value: formatAmount(financials.pendingPayouts),
      color: '#B45309',
      icon: 'solar:hourglass-bold',
      iconBg: '#FEF3C7',
      iconColor: AMBER,
      chip: { label: t('pending_note'), bg: '#FEF3C7', color: '#B45309' },
    },
  ];

  const instructorPct = financials.netInstructorPercent;
  const platformPct = financials.platformPercent;

  return (
    <Box>
      {/* Approved agreement banner */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={({ palette }) => ({
          alignItems: 'center',
          border: `1px dashed ${PRIMARY}`,
          bgcolor: palette.mode === 'dark' ? 'rgba(0,169,128,0.08)' : '#E6F7F2',
          borderRadius: 2,
          px: 2,
          py: 1.25,
          mb: 2.5,
        })}
      >
        <Iconify icon="solar:shield-check-bold" width={22} sx={{ color: PRIMARY, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#065F46' }}>
          {t('agreement', {
            instructor: String(instructorPct),
            platform: String(platformPct),
          })}
        </Typography>
      </Stack>

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
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>

        {/* 4 metric boxes */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {metrics.map((metric) => (
            <Grid key={metric.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: metric.highlighted ? '#EEF2FF' : '#F8FAFC',
                  border: metric.highlighted ? `1.5px solid ${BLUE}` : `1px solid ${CARD_BORDER}`,
                  height: '100%',
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '9px',
                      bgcolor: metric.iconBg,
                      color: metric.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={metric.icon} width={18} />
                  </Box>
                  {metric.chip && (
                    <Chip
                      label={metric.chip.label}
                      size="small"
                      sx={{
                        bgcolor: metric.chip.bg,
                        color: metric.chip.color,
                        fontWeight: 700,
                        fontSize: 9.5,
                        height: 20,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Stack>
                <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', mb: 0.5 }}>
                  {metric.label}
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: metric.color, lineHeight: 1.2 }}>
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Revenue split bar */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: `1px solid ${CARD_BORDER}`,
            mb: 2.5,
          }}
        >
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.25 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: BLUE }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1A1A1A' }}>
                {t('instructor_label', { percent: String(instructorPct) })}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: BLUE }}>
                {formatAmount(financials.netInstructorShare)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#CBD5E1' }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#64748B' }}>
                {t('platform_label', { percent: String(platformPct) })}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#64748B' }}>
                {formatAmount(financials.platformShare)}
              </Typography>
            </Stack>
          </Stack>
          <Box sx={{ height: 12, borderRadius: 999, bgcolor: '#E2E8F0', overflow: 'hidden', display: 'flex' }}>
            <Box
              sx={{
                width: `${instructorPct}%`,
                height: '100%',
                bgcolor: BLUE,
              }}
            />
            <Box sx={{ flex: 1, height: '100%', bgcolor: '#CBD5E1' }} />
          </Box>
        </Box>

        {/* Revenue sources */}
        <Grid container spacing={1.5}>
          {revenueSources.map((source) => (
            <Grid key={source.label} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${CARD_BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      bgcolor: '#E6F7F2',
                      color: PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={source.icon} width={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', mb: 0.25 }}>
                      {source.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY }}>
                      {source.percent}% {t('of_total')}
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
                  {formatAmount(source.amount)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
}
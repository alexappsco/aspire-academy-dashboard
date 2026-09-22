'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Iconify from 'src/components/iconify';

import Chart, { type ApexChartProps } from 'src/components/chart';
import type { StudentGrowthData } from './types';

const PRIMARY = '#00A980';
const CARD_BORDER = '#E2E8F0';

interface Props {
  growth: StudentGrowthData;
}

export default function StudentGrowthChart({ growth }: Props) {
  const t = useTranslations('InstructorAnalytics.growth');

  const labels = growth.points.map((p) => p.month);
  const counts = growth.points.map((p) => p.count);

  const last = growth.points[growth.points.length - 1];

  const series: ApexChartProps['series'] = [{ name: t('students'), data: counts }];

  const options: ApexChartProps['options'] = {
    chart: {
      type: 'area',
      fontFamily: 'Cairo, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [PRIMARY],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: labels,
      labels: { style: { fontSize: '11px', colors: '#94A3B8', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: '10px', colors: '#94A3B8' } },
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      colors: ['#FFFFFF'],
      strokeColors: PRIMARY,
      strokeWidth: 2,
      hover: { size: 6 },
    },
    tooltip: {
      enabled: true,
      style: { fontSize: '12px' },
      y: { formatter: (value) => `${value} ${t('students')}` },
    },
    annotations: {
      points: [
        {
          x: last?.month ?? '',
          y: last?.count ?? 0,
          marker: {
            size: 7,
            fillColor: PRIMARY,
            strokeColor: '#FFFFFF',
            strokeWidth: 3,
            shape: 'circle',
          },
          label: {
            borderColor: PRIMARY,
            text: `${last?.month ?? ''}: ${last?.count ?? 0} ${t('students')} (+${growth.currentGrowthPercent}%)`,
            style: {
              background: PRIMARY,
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'Cairo, sans-serif',
              padding: { left: 6, right: 6, top: 2, bottom: 2 },
            },
            offsetY: -12,
            offsetX: 0,
          },
        },
      ],
    },
  };

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260 }}>
        <Chart options={options} series={series} type="area" height="100%" />
      </Box>

      <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Iconify icon="solar:arrow-up-bold" width={16} sx={{ color: '#059669' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
            {t('new_registrations', {
              count: String(growth.newStudentsThisMonth),
              month: growth.currentMonth,
            })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: PRIMARY,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
            {t('retention', { percent: growth.retentionRate.toFixed(1) })}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
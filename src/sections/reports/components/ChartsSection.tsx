'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Chart, { type ApexChartProps } from 'src/components/chart';

const PRIMARY = '#00A980';
const ORANGE = '#FF9F1C';
const RED = '#E63946';
const CARD_BORDER = '#E0E0E0';

export default function ChartsSection() {
  const tGrowth = useTranslations('Reports.analytics.student_growth');
  const tStatus = useTranslations('Reports.analytics.course_status');

  const donutSeries = [742, 24, 21];
  const donutOptions: ApexChartProps['options'] = {
    chart: { type: 'donut', fontFamily: 'Cairo, sans-serif' },
    colors: [PRIMARY, ORANGE, RED],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#1A1A1A',
              formatter: () => '856',
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: ['#FFFFFF'] },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: false },
    states: { hover: { filter: { type: 'none' } } },
  };

  const areaSeries: ApexChartProps['series'] = [
    {
      name: 'students',
      data: [420, 512, 610, 720, 885, 970, 1040, 1140],
    },
  ];

  const areaOptions: ApexChartProps['options'] = {
    chart: {
      type: 'area',
      fontFamily: 'Cairo, sans-serif',
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    colors: [PRIMARY],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'],
      labels: { style: { fontSize: '10px', colors: '#9CA3AF' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, style: { fontSize: '12px' } },
    markers: {
      size: 4,
      colors: [PRIMARY],
      strokeWidth: 2,
      strokeColors: '#FFFFFF',
    },
  };

  const legendItems = [
    { color: PRIMARY, label: tStatus('legend.published'), count: '742', pct: '86.7%' },
    { color: ORANGE, label: tStatus('legend.under_review'), count: '24', pct: '2.8%' },
    { color: RED, label: tStatus('legend.rejected'), count: '21', pct: '2.5%' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {/* Donut Chart - Left (smaller) */}
      <Grid size={{ xs: 12, lg: 5 }}>
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
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}
            >
              {tStatus('title')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
              {tStatus('subtitle', { total: '856' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
            <Box sx={{ width: 170, height: 170 }}>
              <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" />
            </Box>
          </Box>

          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {legendItems.map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
                    {item.count}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                    ({item.pct})
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Grid>

      {/* Area Chart - Right (larger) */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}
              >
                {tGrowth('title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
                {tGrowth('subtitle', { count: '1140' })}{' '}
                <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>
                  {tGrowth('growth', { percent: '8.5' })}
                </Box>
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: CARD_BORDER,
                color: '#475569',
                fontWeight: 600,
                fontSize: 11,
                borderRadius: 1.5,
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
              }}
            >
              {tGrowth('filter')}
            </Button>
          </Stack>

          <Box sx={{ height: 220, mt: 1 }}>
            <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

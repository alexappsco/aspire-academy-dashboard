'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import Chart, { type ApexChartProps } from 'src/components/chart';
import type { EnrollmentTrendItem } from 'src/types/instructor-reports';

const PRIMARY = '#2563EB';
const CARD_BORDER = '#E0E0E0';

interface Props {
  enrollmentTrend?: EnrollmentTrendItem[];
}

export default function EnrollmentTrendChart({ enrollmentTrend }: Props) {
  const t = useTranslations('InstructorReports.enrollment_trend');

  const hasData = enrollmentTrend !== undefined && enrollmentTrend.length > 0;

  const totalStudents = hasData
    ? enrollmentTrend!.reduce((acc, item) => acc + (item.totalStudents ?? 0), 0)
    : 0;

  const labels = hasData ? enrollmentTrend!.map((item) => item.label) : [];
  const seriesData = hasData ? enrollmentTrend!.map((item) => item.totalStudents ?? 0) : [];

  const series: ApexChartProps['series'] = [{ name: 'students', data: seriesData }];

  const options: ApexChartProps['options'] = {
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
        opacityFrom: 0.22,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: labels,
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

  return (
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, mb: 0.25 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11.5 }}>
          {t('subtitle', { count: String(totalStudents) })}
        </Typography>
      </Box>

      <Box sx={{ height: 240, mt: 1 }}>
        <Chart options={options} series={series} type="area" height="100%" />
      </Box>
    </Card>
  );
}
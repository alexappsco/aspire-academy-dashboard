'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import Iconify from 'src/components/iconify';
import Chart, { ApexChartProps } from 'src/components/chart';
import type { DashboardStudentsOverview } from 'src/types/dashboard';

interface Props {
  studentsOverview?: DashboardStudentsOverview;
}

export default function StudentsOverviewChart({ studentsOverview }: Props) {
  const t = useTranslations('Home.students_chart');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const hasData = studentsOverview !== undefined && studentsOverview.monthlyNewStudents?.length > 0;

  const categories = hasData
    ? studentsOverview.monthlyNewStudents.map((item) => item.label)
    : ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];

  const seriesData = hasData
    ? studentsOverview.monthlyNewStudents.map((item) => item.count)
    : [0, 0, 0, 0, 0, 0];

  const chartOptions: ApexChartProps['options'] = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },
    colors: ['#1E3A8A'],
    stroke: {
      curve: 'smooth',
      width: 2.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#2563EB',
            opacity: 0.22,
          },
          {
            offset: 100,
            color: '#2563EB',
            opacity: 0.0,
          },
        ],
      },
    },
    markers: {
      size: [4],
      colors: ['#0F172A'],
      strokeColors: '#FFFFFF',
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '11px',
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} ${isRtl ? 'طالب' : 'Students'}`,
      },
    },
  };

  const chartSeries = [
    {
      name: isRtl ? 'الطلاب الجدد' : 'New Students',
      data: seriesData,
    },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header with Title and Badges */}
      <Box sx={{ mb: 1.5 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 1,
            mb: 0.5,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:chart-2-bold" width={18} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
            >
              {t('title')}
            </Typography>
          </Stack>

          {studentsOverview ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={`${studentsOverview.newStudentsGrowthPercent >= 0 ? '+' : ''}${studentsOverview.newStudentsGrowthPercent}% ${isRtl ? 'نمو' : 'Growth'}`}
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#10B981',
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                  borderRadius: 1,
                }}
              />
              <Chip
                label={`${isRtl ? 'إجمالي الجدد:' : 'Total New:'} ${studentsOverview.newStudentsThisMonth?.toLocaleString() ?? 0}`}
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                  borderRadius: 1,
                }}
              />
            </Stack>
          ) : (
            <Chip
              label="No data from backend"
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#64748B',
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                borderRadius: 1,
              }}
            />
          )}
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Chart Area */}
      <Box sx={{ my: 1, mx: -1 }}>
        <Chart options={chartOptions} series={chartSeries} type="area" height={210} />
      </Box>

      {/* Bottom 3 KPIs Row */}
      <Box
        sx={{
          p: 1.75,
          mt: 1.5,
          borderRadius: 2.5,
          bgcolor: '#F0F3FF80',
          border: '1px solid #E8EEFF',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }} sx={{ textAlign: isRtl ? 'right' : 'left' }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              {t('monthly_active')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: studentsOverview ? 17 : 13,
              }}
            >
              {studentsOverview
                ? studentsOverview.monthlyActiveStudents.toLocaleString()
                : 'No data from backend'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              {t('completion_rate')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#10B981',
                fontSize: studentsOverview ? 17 : 13,
              }}
            >
              {studentsOverview
                ? `${studentsOverview.completionRate}%`
                : 'No data from backend'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }} sx={{ textAlign: isRtl ? 'left' : 'right' }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              {t('avg_study_hours')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#2563EB',
                fontSize: studentsOverview ? 17 : 13,
              }}
            >
              {studentsOverview ? (
                <>
                  {studentsOverview.avgStudyHours}{' '}
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{t('hours_per_student')}</span>
                </>
              ) : (
                'No data from backend'
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

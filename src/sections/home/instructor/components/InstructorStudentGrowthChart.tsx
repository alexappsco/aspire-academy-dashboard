'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify';
import Chart, { type ApexChartProps } from 'src/components/chart';
import type { StudentGrowthChartData } from '../types';

interface Props {
  data: StudentGrowthChartData;
}

export default function InstructorStudentGrowthChart({ data }: Props) {
  const t = useTranslations('InstructorHome.charts');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('30_days');

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = (filterKey?: string) => {
    if (filterKey) setSelectedFilter(filterKey);
    setFilterAnchorEl(null);
  };

  const categories = data.dataPoints.map((item) => `${item.month} (${item.count})`);
  const seriesData = data.dataPoints.map((item) => item.count);

  const chartOptions: ApexChartProps['options'] = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    colors: ['#00A76F'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#00A76F',
            opacity: 0.32,
          },
          {
            offset: 100,
            color: '#00A76F',
            opacity: 0.02,
          },
        ],
      },
    },
    markers: {
      size: 5,
      colors: ['#00A76F'],
      strokeColors: '#FFFFFF',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: data.dataPoints.map((item) => (item.isCurrent ? '#00A76F' : '#94A3B8')),
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
        formatter: (val: number) => `${val} ${t('registered_course')}`,
      },
    },
  };

  const chartSeries = [
    {
      name: t('student_growth_title'),
      data: seriesData,
    },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        {/* Title and Subtitle */}
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1C252E' }}>
            {t('student_growth_title')}
          </Typography>
          <Typography sx={{ color: '#00A76F', fontSize: '0.85rem', fontWeight: 600, mt: 0.5 }}>
            {t('student_growth_subtitle', {
              count: data.newStudentsCount ?? 0,
              percent: data.growthPercentage ?? 0,
            })}
          </Typography>
        </Box>

        {/* Filter Dropdown */}
        <Box>
          <Button
            size="small"
            onClick={handleOpenFilter}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              textTransform: 'none',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            {t('filter_last_30_days')}
          </Button>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => handleCloseFilter()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleCloseFilter('7_days')} sx={{ fontSize: '0.85rem' }}>
              آخر 7 أيام
            </MenuItem>
            <MenuItem onClick={() => handleCloseFilter('30_days')} sx={{ fontSize: '0.85rem' }}>
              {t('filter_last_30_days')}
            </MenuItem>
            <MenuItem onClick={() => handleCloseFilter('90_days')} sx={{ fontSize: '0.85rem' }}>
              آخر 3 أشهر
            </MenuItem>
          </Menu>
        </Box>
      </Stack>

      {/* Chart Canvas */}
      <Box sx={{ mt: 1, mx: -1.5, mb: -1 }}>
        <Chart options={chartOptions} series={chartSeries} type="area" height={240} />
      </Box>
    </Card>
  );
}

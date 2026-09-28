'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chart, { type ApexChartProps } from 'src/components/chart';
import type { CourseStatusChartData } from '../types';

interface Props {
  data: CourseStatusChartData;
}

export default function InstructorCourseStatusChart({ data }: Props) {
  const t = useTranslations('InstructorHome.charts');

  const series = data.items.map((item) => item.count);
  const labels = data.items.map((item) => item.label);
  const colors = data.items.map((item) => item.color);

  const chartOptions: ApexChartProps['options'] = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
    },
    colors,
    labels,
    stroke: {
      show: true,
      width: 3,
      colors: ['#FFFFFF'],
    },
    legend: {
      show: false,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `${val} ${t('registered_course')}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '78%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontWeight: 500,
              color: '#94A3B8',
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 800,
              color: '#1C252E',
              offsetY: -16,
              formatter: () => `${data.totalCount}`,
            },
            total: {
              show: true,
              label: t('registered_course'),
              fontSize: '12px',
              fontWeight: 600,
              color: '#94A3B8',
              formatter: () => `${data.totalCount}`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

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
      {/* Title & Subtitle */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1C252E' }}>
          {t('course_status_title')}
        </Typography>
        <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', mt: 0.25 }}>
          {t('total_courses', { count: data.totalCount })}
        </Typography>
      </Box>

      {/* Donut Chart */}
      <Box sx={{ my: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Chart options={chartOptions} series={series} type="donut" width={240} height={240} />
      </Box>

      {/* Custom Legend */}
      <Stack spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: '1px solid #F8FAFC' }}>
        {data.items.map((item, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Right: Dot + Label */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                {item.label}
              </Typography>
            </Stack>

            {/* Left: Count & Percentage */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C252E' }}>
              <Box component="span" sx={{ color: '#94A3B8', fontWeight: 500, mr: 0.5 }}>
                ({item.percentage}%)
              </Box>
              {item.count}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

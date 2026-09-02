'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import Iconify from 'src/components/iconify';
import { CourseDetailsData } from '../types';

interface CourseKpiCardsProps {
  course: CourseDetailsData;
}

export default function CourseKpiCards({ course }: CourseKpiCardsProps) {
  const t = useTranslations('CourseDetails.kpis');

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {/* 1. Total Students */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('total_students')}
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              sx={{
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                borderRadius: 1.5,
                px: 1,
                py: 0.3,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Iconify icon="solar:arrow-right-up-linear" width={14} />
              {course.studentsGrowth}
            </Box>

            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>
              {course.totalStudents}
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* 2. Completion Rate */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('completion_rate')}
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ width: 70 }}>
              <LinearProgress
                variant="determinate"
                value={course.completionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#2563EB',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>
              {course.completionRate}%
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* 3. Average Rating */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('avg_rating')}
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.3}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Iconify
                  key={star}
                  icon="solar:star-bold"
                  width={15}
                  sx={{ color: '#F59E0B' }}
                />
              ))}
            </Stack>

            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>
              {course.avgRating}
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* 4. Total Revenue */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('total_revenue')}
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6',
              }}
            >
              <Iconify icon="solar:wallet-money-outline" width={18} />
            </Box>

            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1E293B' }}>
              {course.totalRevenue}
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}

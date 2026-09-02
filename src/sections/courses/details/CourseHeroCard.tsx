'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
import { CourseDetailsData } from '../types';

interface CourseHeroCardProps {
  course: CourseDetailsData;
}

export default function CourseHeroCard({ course }: CourseHeroCardProps) {
  const t = useTranslations('CourseDetails.hero');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        p: { xs: 2.5, sm: 3 },
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: 'column-reverse', md: 'row' }}
        spacing={3}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        {/* Left Side (in RTL): Stats & Published Date */}
        <Box sx={{ flex: 1, width: '100%' }}>
          {/* Stats Row */}
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 4 }}
            sx={{
              alignItems: 'center',
              justifyContent: { xs: 'space-around', md: 'flex-start' },
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* 1. Rating */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B', mb: 0.5 }}>
                {t('rating')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <Iconify icon="solar:star-bold" width={18} sx={{ color: '#F59E0B' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
                  {course.rating}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.2 }}>
                {t('reviews_count', { count: course.reviewsCount })}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />

            {/* 2. Students */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B', mb: 0.5 }}>
                {t('students')}
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
                {course.studentsCount.toLocaleString()}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />

            {/* 3. Duration */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B', mb: 0.5 }}>
                {t('duration')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <Iconify icon="solar:clock-circle-outline" width={18} sx={{ color: '#64748B' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
                  {course.duration}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />

            {/* 4. Price */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B', mb: 0.5 }}>
                {t('price')}
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#0284C7' }}>
                {course.price}
              </Typography>
            </Box>
          </Stack>

          {/* Published Date */}
          <Typography
            sx={{
              fontSize: 13,
              color: '#64748B',
              textAlign: { xs: 'center', md: isRtl ? 'right' : 'left' },
            }}
          >
            {t('published_on', {
              date: isRtl ? course.publishDate_ar : course.publishDate_en,
            })}
          </Typography>
        </Box>

        {/* Right Side (in RTL): Course Cover Image */}
        <Box
          sx={{
            width: { xs: '100%', sm: 220, md: 240 },
            height: 130,
            borderRadius: 2.5,
            overflow: 'hidden',
            bgcolor: '#0F172A',
            border: '1px solid #E2E8F0',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundImage:
              'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.3)), radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
          }}
        >
          {/* Medical / Cardiology stylized visual placeholder */}
          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <Iconify icon="solar:heart-pulse-bold" width={44} sx={{ color: '#38BDF8' }} />
            <Typography sx={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
              CARDIOVASCULAR
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import CourseHeroCard from './details/CourseHeroCard';
import CourseKpiCards from './details/CourseKpiCards';
import ContentSummaryCard from './details/ContentSummaryCard';
import RecentReviewsCard from './details/RecentReviewsCard';
import RecentEnrollmentsTable from './details/RecentEnrollmentsTable';
import { CourseDetailsData } from './types';
import { MOCK_COURSE_DETAILS } from './_mock';

interface CourseDetailsViewProps {
  id?: string;
}

export default function CourseDetailsView({ id: _id }: CourseDetailsViewProps) {
  const t = useTranslations('CourseDetails');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [course, setCourse] = useState<CourseDetailsData>(MOCK_COURSE_DETAILS);
  const [currentTab, setCurrentTab] = useState('overview');

  const handleTogglePublish = () => {
    const nextStatus = course.status === 'published' ? 'unpublished' : 'published';
    setCourse((prev) => ({ ...prev, status: nextStatus }));
    toast.success(
      nextStatus === 'published' ? t('header.published') : t('header.unpublish')
    );
  };

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Header & Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        {/* Breadcrumbs & Title */}
        <Box>
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { mx: 1, color: '#94A3B8' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push('/courses')}
              sx={{ cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 500 }}
            >
              {t('breadcrumbs.courses')}
            </Link>
            <Typography sx={{ fontSize: 13, color: '#1E293B', fontWeight: 600 }}>
              {isRtl ? course.title_ar : course.title_en}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 1 }}>
            {isRtl ? course.title_ar : course.title_en}
          </Typography>

          {/* Meta Info (Specialty, Lecturer, Status) */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#64748B' }}>
              <Box component="span" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {t('header.specialty_prefix')}{' '}
              </Box>
              {isRtl ? course.specialty_ar : course.specialty_en}
            </Typography>

            <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>•</Typography>

            <Typography sx={{ fontSize: 13, color: '#64748B' }}>
              <Box component="span" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {t('header.lecturer_prefix')}{' '}
              </Box>
              {isRtl ? course.lecturer_ar : course.lecturer_en}
            </Typography>

            <Box
              sx={{
                bgcolor: course.status === 'published' ? '#ECFDF5' : '#F1F5F9',
                color: course.status === 'published' ? '#10B981' : '#64748B',
                borderRadius: 1,
                px: 1.2,
                py: 0.2,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {course.status === 'published' ? t('header.published') : t('header.unpublish')}
            </Box>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Edit Course Button */}
          <Button
            variant="contained"
            onClick={() => router.push('/courses/new')}
            startIcon={<Iconify icon="solar:pen-bold" width={18} />}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: 'none',
              gap: 1,
              '&:hover': { bgcolor: '#0369A1' },
            }}
          >
            {t('header.edit_course')}
          </Button>

          {/* Unpublish / Publish Toggle Button */}
          <Button
            variant="outlined"
            onClick={handleTogglePublish}
            startIcon={
              <Iconify
                icon={
                  course.status === 'published'
                    ? 'solar:eye-closed-bold'
                    : 'solar:eye-bold'
                }
                width={18}
              />
            }
            sx={{
              borderColor: '#E2E8F0',
              color: '#0284C7',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              gap: 1,
              bgcolor: '#FFFFFF',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            {course.status === 'published' ? t('header.unpublish') : t('header.publish')}
          </Button>

          {/* More Options Button */}
          <IconButton
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 1.5,
              p: 1,
              bgcolor: '#FFFFFF',
              color: '#64748B',
            }}
          >
            <Iconify icon="eva:more-vertical-fill" width={20} />
          </IconButton>
        </Stack>
      </Stack>

      {/* 2. Course Hero Summary Card */}
      <CourseHeroCard course={course} />

      {/* 3. KPI Statistics Cards */}
      <CourseKpiCards course={course} />

      {/* 4. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{
            '& .MuiTab-root': {
              fontSize: 15,
              fontWeight: 600,
              color: '#64748B',
              minWidth: 100,
              textTransform: 'none',
              pb: 1.5,
              '&.Mui-selected': {
                color: '#0284C7',
                fontWeight: 700,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#0284C7',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab value="overview" label={t('tabs.overview')} />
          <Tab value="content" label={t('tabs.content')} />
          <Tab value="students" label={t('tabs.students')} />
          <Tab value="reviews" label={t('tabs.reviews')} />
          <Tab value="analytics" label={t('tabs.analytics')} />
        </Tabs>
      </Box>

      {/* 5. Main Tab Content (2 Columns Layout) */}
      {currentTab === 'overview' && (
        <Grid container spacing={3}>
          {/* Main Area (Right in RTL / Left in LTR): Course Info & Recent Enrollments */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Course Information Card */}
              <Card
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 2.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #F1F3F5',
                  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#1E293B', mb: 2, fontSize: 18 }}
                >
                  {t('course_info.title')}
                </Typography>

                <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />

                <Stack spacing={2}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: '#475569',
                      lineHeight: 1.8,
                      textAlign: 'justify',
                    }}
                  >
                    {t('course_info.paragraph_1')}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 14,
                      color: '#475569',
                      lineHeight: 1.8,
                      textAlign: 'justify',
                    }}
                  >
                    {t('course_info.paragraph_2')}
                  </Typography>
                </Stack>
              </Card>

              {/* Recent Enrollments Table */}
              <RecentEnrollmentsTable
                enrollments={course.recentEnrollments}
                onViewAll={() => setCurrentTab('students')}
              />
            </Stack>
          </Grid>

          {/* Sidebar Area (Left in RTL / Right in LTR): Content Summary & Recent Reviews */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* Content Summary */}
              <ContentSummaryCard
                course={course}
                onManageContent={() => setCurrentTab('content')}
              />

              {/* Recent Reviews */}
              <RecentReviewsCard
                reviews={course.recentReviews}
                onViewAll={() => setCurrentTab('reviews')}
              />
            </Stack>
          </Grid>
        </Grid>
      )}

      {currentTab !== 'overview' && (
        <Card
          sx={{
            p: 6,
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 15, fontWeight: 500 }}>
            {t(`tabs.${currentTab}`)} - قريباً
          </Typography>
        </Card>
      )}
    </Box>
  );
}

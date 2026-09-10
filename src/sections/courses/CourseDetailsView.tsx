'use client';

import React, { useEffect, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { getCourseById } from 'src/actions/courses';
import type { CourseDto } from 'src/types/course';
import CourseHeroCard from './details/CourseHeroCard';
import CourseKpiCards from './details/CourseKpiCards';
import ContentSummaryCard from './details/ContentSummaryCard';
import RecentReviewsCard from './details/RecentReviewsCard';
import RecentEnrollmentsTable from './details/RecentEnrollmentsTable';
import CourseContentTab from './components/CourseContentTab';
import CourseStudentsTab from './components/CourseStudentsTab';
import type { CourseDetailsData } from './types';

interface CourseDetailsViewProps {
  id?: string;
}

const COURSE_TYPE_KEYS: Record<number, string> = {
  1: 'full',
  2: 'midterm',
  3: 'final',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack spacing={0.4}>
      <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{label}</Typography>
      <Typography component="div" sx={{ fontSize: 14, color: '#1E293B', fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [minutes, seconds].map((n) => String(n).padStart(2, '0'));
  return hours ? `${hours}h ${parts.join(':')}` : parts.join(':');
}

function mapCourseToDetailsData(course: CourseDto): CourseDetailsData {
  const chapters = course.curriculum?.chapters ?? [];
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const durationSeconds = course.totalDurationInSeconds ?? lessons.reduce((sum, lesson) => sum + (lesson.durationInSeconds ?? 0), 0);
  const isPublished = Number(course.status) === 1 || course.status === '1' || course.status === 'published' || course.isActive === true;
  const currencySymbol = course.currency?.symbol ?? '';

  return {
    id: course.id,
    title_ar: course.title,
    title_en: course.title,
    specialty_ar: course.specialization?.name || '',
    specialty_en: course.specialization?.name || '',
    lecturer_ar: course.instructor?.title || course.instructor?.name || '',
    lecturer_en: course.instructor?.title || course.instructor?.name || '',
    status: isPublished ? 'published' : 'unpublished',
    rating: course.ratingAverage ?? 0,
    reviewsCount: course.ratingCount ?? 0,
    studentsCount: course.studentsCount ?? 0,
    duration: formatDuration(durationSeconds),
    price: `${currencySymbol}${course.price.toLocaleString()}`,
    oldPrice: course.oldPrice ? `${currencySymbol}${course.oldPrice.toLocaleString()}` : '',
    currencySymbol,
    type: course.type ?? '',
    field_ar: course.field?.name || '',
    field_en: course.field?.name || '',
    faculty_ar: course.faculty?.name || '',
    faculty_en: course.faculty?.name || '',
    studyMaterial_ar: course.studyMaterial?.name || '',
    studyMaterial_en: course.studyMaterial?.name || '',
    accessDurationInDays: course.accessDurationInDays ?? 0,
    lastUpdated: course.lastUpdatedAt || course.creationTime || '',
    publishDate_ar: (course.lastUpdatedAt || course.creationTime)
      ? new Date(course.lastUpdatedAt || course.creationTime!).toLocaleDateString('ar-KW')
      : '',
    publishDate_en: (course.lastUpdatedAt || course.creationTime)
      ? new Date(course.lastUpdatedAt || course.creationTime!).toLocaleDateString('en-US')
      : '',
    imageUrl: course.imageUrl || '',
    totalStudents: (course.studentsCount ?? 0).toLocaleString(),
    studentsGrowth: '',
    completionRate: 0,
    avgRating: (course.ratingAverage ?? 0).toFixed(1),
    totalRevenue: '',
    description_ar: course.description || '',
    description_en: course.description || '',
    chaptersCount: chapters.length,
    videosCount: lessons.filter((lesson) => lesson.videoUrl).length,
    quizzesCount: lessons.filter((lesson) => (lesson.test?.questions?.length ?? 0) > 0).length,
    resourcesCount: lessons.reduce((sum, lesson) => sum + (lesson.attachmentIds?.length ?? 0), 0),
    objectives: course.objectives ?? [],
    recentEnrollments: [],
    recentReviews: [],
    curriculum: course.curriculum ?? null,
  };
}

export default function CourseDetailsView({ id }: CourseDetailsViewProps) {
  const t = useTranslations('CourseDetails');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [course, setCourse] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'content' | 'students'>('overview');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getCourseById(id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setCourse(mapCourseToDetailsData(res.data));
      } else {
        setLoadError(res.error || t('errors.load_failed'));
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, t]);

  const handleTogglePublish = () => {
    if (!course) return;
    const nextStatus = course.status === 'published' ? 'unpublished' : 'published';
    setCourse((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    toast.success(nextStatus === 'published' ? t('header.published') : t('header.unpublish'));
  };

  const typeKey = COURSE_TYPE_KEYS[Number(course?.type)] ?? 'full';
  const typeLabels: Record<string, string> = {
    full: t('course_info.types.full'),
    midterm: t('course_info.types.midterm'),
    final: t('course_info.types.final'),
  };
  const typeLabel = typeLabels[typeKey] ?? typeLabels.full;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course || loadError) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
          {t('errors.not_found')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.push('/courses')}
          sx={{ borderColor: '#E2E8F0', color: '#1E293B', borderRadius: 1.5, fontWeight: 600 }}
        >
          {t('errors.back_to_courses')}
        </Button>
      </Box>
    );
  }

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
            onClick={() => router.push(`/courses/${course.id}/edit`)}
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

      {/* 4. Navigation Tabs (Only 3 tabs: Overview, Content, Students) */}
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
        </Tabs>
      </Box>

      {/* 5. Tab Panels */}
      {/* 5.1 Overview Tab */}
      {currentTab === 'overview' && (
        <Grid container spacing={3}>
          {/* Main Area: Course Info & Recent Enrollments */}
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

                {/* Course Meta Details Grid */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label={t('course_info.type')} value={typeLabel} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.price')}
                      value={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: '#0284C7' }}>
                            {course.price}
                          </Typography>
                          {course.oldPrice && (
                            <Typography
                              sx={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}
                            >
                              {course.oldPrice}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.faculty')}
                      value={isRtl ? course.faculty_ar : course.faculty_en}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label={t('course_info.field')} value={isRtl ? course.field_ar : course.field_en} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.specialization')}
                      value={isRtl ? course.specialty_ar : course.specialty_en}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.study_material')}
                      value={isRtl ? course.studyMaterial_ar : course.studyMaterial_en}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.access_duration')}
                      value={
                        course.accessDurationInDays
                          ? t('course_info.days', { count: course.accessDurationInDays })
                          : '—'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label={t('course_info.last_updated')}
                      value={
                        course.lastUpdated
                          ? new Date(course.lastUpdated).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US')
                          : '—'
                      }
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />

                <Stack spacing={2.5}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: '#475569',
                      lineHeight: 1.8,
                      textAlign: 'justify',
                    }}
                  >
                    {isRtl ? course.description_ar : course.description_en}
                  </Typography>

                  {/* Learning Objectives */}
                  {course.objectives.length > 0 && (
                    <Box>
                      <Typography
                        sx={{ fontWeight: 700, color: '#1E293B', fontSize: 14, mb: 1.5 }}
                      >
                        {t('course_info.learning_objectives')}
                      </Typography>
                      <Stack spacing={1}>
                        {[...course.objectives]
                          .sort((a, b) => a.order - b.order)
                          .map((objective) => (
                            <Stack key={objective.id ?? objective.order} direction="row" spacing={1.5}>
                              <Box
                                component="span"
                                sx={{
                                  mt: 0.4,
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  bgcolor: '#EFF6FF',
                                  color: '#0284C7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {objective.order}
                              </Box>
                              <Typography
                                sx={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}
                              >
                                {objective.text}
                              </Typography>
                            </Stack>
                          ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Card>

              {/* Recent Enrollments Table */}
              <RecentEnrollmentsTable
                enrollments={course.recentEnrollments}
                onViewAll={() => setCurrentTab('students')}
              />
            </Stack>
          </Grid>

          {/* Sidebar Area: Content Summary & Recent Reviews */}
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
              />
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* 5.2 Content Tab */}
      {currentTab === 'content' && <CourseContentTab curriculum={course.curriculum} />}

      {/* 5.3 Students Tab */}
      {currentTab === 'students' && (
        <CourseStudentsTab courseId={course.id} />
      )}
    </Box>
  );
}
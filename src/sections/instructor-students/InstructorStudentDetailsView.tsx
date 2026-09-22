'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslations, useLocale } from 'next-intl';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { Link, useRouter } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';
import {
  getInstructorStudentDetailsAction,
  getInstructorStudentCoursesAction,
} from 'src/actions/instructor-students';
import type {
  InstructorStudentDetailDto,
  InstructorStudentCourseItemDto,
} from 'src/types/instructor-student';

interface Props {
  studentId: string;
}

export default function InstructorStudentDetailsView({ studentId }: Props) {
  const t = useTranslations('InstructorStudents');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const isRtl = locale === 'ar';

  const [student, setStudent] = useState<InstructorStudentDetailDto | null>(null);
  const [courses, setCourses] = useState<InstructorStudentCourseItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [detailsRes, coursesRes] = await Promise.all([
        getInstructorStudentDetailsAction(studentId),
        getInstructorStudentCoursesAction(studentId, { SkipCount: 0, MaxResultCount: 200 }),
      ]);

      if (detailsRes.success && detailsRes.data) {
        setStudent(detailsRes.data);
      } else {
        setError(detailsRes.error || 'Failed to load student details');
      }

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch instructor student details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              إعادة المحاولة
            </Button>
          }
        >
          {error || 'Student not found'}
        </Alert>
      </Box>
    );
  }

  // Courses table columns
  const tableHead = [
    {
      id: 'course',
      label: t('details.courses_table.course_title'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'enrolledAt',
      label: t('details.courses_table.enrolled_at'),
      align: 'center' as cellAlignment,
      width: 130,
    },
    {
      id: 'progress',
      label: t('details.courses_table.progress'),
      align: 'center' as cellAlignment,
      width: 170,
    },
    {
      id: 'status',
      label: t('details.courses_table.status'),
      align: 'center' as cellAlignment,
      width: 120,
    },
  ];

  const customRender = {
    course: (row: InstructorStudentCourseItemDto) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          src={row.courseImageUrl || undefined}
          alt={row.courseTitle}
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            fontWeight: 700,
            fontSize: '0.8rem',
            border: '1px solid #E2E8F0',
          }}
        >
          <Iconify icon="solar:book-bookmark-bold" width={22} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
            {row.courseTitle}
          </Typography>
          {row.expiresAt && (
            <Typography variant="caption" sx={{ color: '#637381', display: 'block' }}>
              {t('details.courses_table.expires_at')}: {formatDate(row.expiresAt)}
            </Typography>
          )}
        </Box>
      </Stack>
    ),
    enrolledAt: (row: InstructorStudentCourseItemDto) => (
      <Typography variant="body2" sx={{ color: '#637381', fontSize: '0.85rem' }}>
        {formatDate(row.enrolledAt)}
      </Typography>
    ),
    progress: (row: InstructorStudentCourseItemDto) => {
      const percent = Math.min(100, Math.max(0, row.progressPercent || 0));
      return (
        <Box sx={{ width: '100%', px: 1 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {percent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': {
                bgcolor: percent === 100 ? '#10B981' : '#2563EB',
                borderRadius: 3,
              },
            }}
          />
        </Box>
      );
    },
    status: (row: InstructorStudentCourseItemDto) => {
      const isCompleted = !!row.completedAt || row.progressPercent === 100;
      return (
        <Chip
          size="small"
          label={
            isCompleted
              ? t('details.courses_table.status_completed')
              : t('details.courses_table.status_in_progress')
          }
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: isCompleted ? '#ECFDF5' : '#EFF6FF',
            color: isCompleted ? '#059669' : '#2563EB',
          }}
        />
      );
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={
          <Iconify
            icon={isRtl ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'}
            width={14}
            sx={{ color: '#94A3B8' }}
          />
        }
        sx={{ mb: 3, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
      >
        <Link href="/students">{t('details.breadcrumb_students')}</Link>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
          {t('details.details_title')}
        </Typography>
      </Breadcrumbs>

      {/* Header Profile Card */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Avatar
            src={student.imageUrl || undefined}
            alt={student.name}
            sx={{
              width: 72,
              height: 72,
              bgcolor: '#E0F2FE',
              color: '#0284C7',
              fontWeight: 800,
              fontSize: '1.5rem',
              border: '2px solid #E2E8F0',
            }}
          >
            {student.name ? student.name.slice(0, 2).toUpperCase() : 'ST'}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C252E' }}>
                {student.name}
              </Typography>
              <Chip
                size="small"
                label={student.isActive ? t('details.active') : t('details.inactive')}
                sx={{
                  bgcolor: student.isActive ? '#ECFDF5' : '#FEE2E2',
                  color: student.isActive ? '#059669' : '#DC2626',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: '#637381', fontSize: '0.85rem' }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Iconify icon="solar:letter-bold" width={16} sx={{ color: '#919EAB' }} />
                <Typography variant="body2">{student.email}</Typography>
              </Stack>

              {student.country && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Iconify icon="solar:map-point-bold" width={16} sx={{ color: '#919EAB' }} />
                  <Typography variant="body2">{student.country.name}</Typography>
                </Stack>
              )}

              {student.lastActiveAt && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: '#919EAB' }} />
                  <Typography variant="body2">
                    {t('details.last_active')}: {formatDate(student.lastActiveAt)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>

      {/* 3 Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Courses */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#637381', fontWeight: 600 }}>
                {t('details.stats.total_courses')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C252E', my: 0.5 }}>
                {student.enrollmentsCount ?? courses.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#919EAB' }}>
                {t('details.stats.total_courses_sub')}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <Iconify icon="solar:document-text-bold" width={24} />
            </Box>
          </Card>
        </Grid>

        {/* Completed Courses */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#637381', fontWeight: 600 }}>
                {t('details.stats.completed_courses')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', my: 0.5 }}>
                {student.completedCoursesCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#919EAB' }}>
                {t('details.stats.completed_courses_sub')}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={24} />
            </Box>
          </Card>
        </Grid>

        {/* In Progress Courses */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#637381', fontWeight: 600 }}>
                {t('details.stats.in_progress_courses')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', my: 0.5 }}>
                {student.inProgressCoursesCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#919EAB' }}>
                {t('details.stats.in_progress_courses_sub')}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284C7',
              }}
            >
              <Iconify icon="solar:history-bold" width={24} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Personal Information & Academic Card */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', mb: 2.5 }}>
          {t('details.personal_info')}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
              {t('details.name')}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {student.name || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
              {t('details.email')}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {student.email || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
              {t('details.country')}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {student.country?.name || '-'}
            </Typography>
          </Grid>

          {student.graduationYear ? (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
                {t('details.graduation_year')}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
                {student.graduationYear}
              </Typography>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
              {t('details.account_status')}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: student.isActive ? '#059669' : '#DC2626' }}>
              {student.isActive ? t('details.active') : t('details.inactive')}
            </Typography>
          </Grid>

          {student.lastActiveAt ? (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 0.5 }}>
                {t('details.last_active')}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C252E' }}>
                {formatDate(student.lastActiveAt)}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </Card>

      {/* Courses Record Table */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E' }}>
            {t('details.courses_record')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#637381' }}>
            {t('details.courses_record_subtitle')}
          </Typography>
        </Box>

        {courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#919EAB' }}>
            <Iconify icon="solar:book-bookmark-bold" width={48} sx={{ mb: 1, opacity: 0.4 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('details.courses_table.empty')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 0.5 }}>
            <SharedTable<InstructorStudentCourseItemDto>
              data={courses}
              count={courses.length}
              tableHead={tableHead}
              customRender={customRender}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}

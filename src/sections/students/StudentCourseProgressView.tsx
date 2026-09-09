'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from 'next/link';

import Iconify from 'src/components/iconify';
import { getStudentCourseProgress } from 'src/actions/students';
import type { StudentCourseProgressResponse } from 'src/types/student';

interface Props {
  studentId: string;
  courseId: string;
}

function formatDurationHours(seconds: number): string {
  if (!seconds || seconds <= 0) return '0';
  const hours = (seconds / 3600).toFixed(1);
  return hours.endsWith('.0') ? String(Math.round(seconds / 3600)) : hours;
}

function formatSecondsToMinutes(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 دقيقة';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs} ساعة و ${remMins} دقيقة` : `${hrs} ساعة`;
}

function formatTimePosition(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function StudentCourseProgressView({ studentId, courseId }: Props) {
  const [data, setData] = useState<StudentCourseProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentCourseProgress(studentId, courseId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'تعذر تحميل بيانات تقدم الدورة للطالب');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [studentId, courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 4 }}>
        <Breadcrumbs
          separator={<Iconify icon="solar:alt-arrow-left-linear" width={14} sx={{ color: '#94A3B8' }} />}
          sx={{ mb: 3, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Link href="/students">إدارة الطلاب</Link>
          <Link href={`/students/${studentId}`}>تفاصيل الطالب</Link>
          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>تقدم الدورة</Typography>
        </Breadcrumbs>

        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              إعادة المحاولة
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error || 'لا توجد بيانات متاحة لهذه الدورة'}
        </Alert>
      </Box>
    );
  }

  const isCompleted = data.progressPercent >= 100 || !!data.completedAt;
  const statusText = isCompleted ? 'مكتملة' : data.progressPercent > 0 ? 'قيد الدراسة حالياً' : 'لم تبدأ بعد';
  const remainingLessons = Math.max(0, (data.totalLessons || 0) - (data.completedLessons || 0));

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* Breadcrumbs & Title */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<Iconify icon="solar:alt-arrow-left-linear" width={14} sx={{ color: '#94A3B8' }} />}
          sx={{ mb: 1, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Link href="/students">إدارة الطلاب</Link>
          <Link href={`/students/${studentId}`}>{data.studentName || 'تفاصيل الطالب'}</Link>
          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
            تقدم الدورة
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: 22, md: 26 },
          }}
        >
          إدارة الطلاب
        </Typography>
      </Box>

      {/* 1. Course Header Card */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 900,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:book-bookmark-bold" width={28} />
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 18, md: 21 } }}
                >
                  {data.courseTitle}
                </Typography>

                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isCompleted ? '#10B981' : '#2563EB',
                        }}
                      />
                      <span>{statusText}</span>
                    </Stack>
                  }
                  size="small"
                  sx={{
                    bgcolor: isCompleted ? '#ECFDF5' : '#EFF6FF',
                    color: isCompleted ? '#059669' : '#2563EB',
                    fontWeight: 700,
                    fontSize: 11.5,
                    height: 24,
                    borderRadius: 1.5,
                  }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 500,
                  mt: 0.75,
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:user-bold" width={15} sx={{ color: '#94A3B8' }} />
                  <span>
                    الطالب: <strong style={{ color: '#1E293B' }}>{data.studentName}</strong>
                  </span>
                </Stack>

                {data.instructorName && (
                  <>
                    <span>•</span>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:square-academic-cap-2-bold" width={15} sx={{ color: '#94A3B8' }} />
                      <span>
                        المحاضر المسؤول: <strong style={{ color: '#1E293B' }}>{data.instructorName}</strong>
                      </span>
                    </Stack>
                  </>
                )}

                {data.enrolledAt && (
                  <>
                    <span>•</span>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:calendar-date-bold" width={15} sx={{ color: '#94A3B8' }} />
                      <span>تاريخ التسجيل: {formatDate(data.enrolledAt)}</span>
                    </Stack>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Card>

      {/* 2. 3 Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Progress Card */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                نسبة التقدم الإجمالية
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:chart-2-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', gap: 1, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#2563EB', fontSize: 28 }}>
                  {Math.round(data.progressPercent)}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                  {data.progressPercent >= 100 ? 'مكتمل بنجاح' : data.progressPercent > 50 ? 'مستوى متقدم' : 'قيد الإنجاز'}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, data.progressPercent))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#F1F5F9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: data.progressPercent >= 100 ? '#10B981' : '#2563EB',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Completed Lessons */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                الدروس المكتملة
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:check-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', fontSize: 28, mb: 0.5 }}>
                {data.completedLessons} / {data.totalLessons}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>
                {remainingLessons === 0 ? 'تم إكمال جميع الوحدات' : `متبقي ${remainingLessons} درس`}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Recorded Watch Time */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                إجمالي وقت المشاهدة
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:clock-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 28 }}>
                  {formatDurationHours(data.totalDurationInSeconds)}
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748B', fontSize: 16, fontWeight: 600 }}>
                  ساعة
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                ساعات تدريبية للمادة
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Chapters and Lessons Breakdown */}
      {(!data.chapters || data.chapters.length === 0) ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #F1F5F9' }}>
          <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
            لا توجد فصول أو دروس متاحة لهذه الدورة حالياً
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {data.chapters.map((chapter, idx) => {
            const isChapterCompleted = chapter.progressPercent >= 100 || (chapter.totalLessons > 0 && chapter.completedLessons >= chapter.totalLessons);

            return (
              <Card
                key={chapter.id || idx}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                {/* Chapter Header */}
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: isChapterCompleted ? '#F0FDF4' : '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: isChapterCompleted ? '#DCFCE7' : '#EFF6FF',
                          color: isChapterCompleted ? '#16A34A' : '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify
                          icon={isChapterCompleted ? 'solar:check-read-bold' : 'solar:play-circle-bold'}
                          width={18}
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                          {chapter.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                          {chapter.completedLessons} من {chapter.totalLessons} درس مكتمل
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={
                        isChapterCompleted
                          ? 'مكتمل 100% ✓'
                          : chapter.progressPercent > 0
                          ? `قيد الدراسة (${Math.round(chapter.progressPercent)}%)`
                          : 'لم يبدأ'
                      }
                      size="small"
                      sx={{
                        bgcolor: isChapterCompleted ? '#DCFCE7' : '#EFF6FF',
                        color: isChapterCompleted ? '#15803D' : '#2563EB',
                        fontWeight: 700,
                        fontSize: 12,
                        height: 26,
                        borderRadius: 1.5,
                      }}
                    />
                  </Stack>
                </Box>

                {/* Lesson Items */}
                <Stack spacing={0} divider={<Box sx={{ borderBottom: '1px solid #F8FAFC' }} />}>
                  {chapter.lessons?.map((lesson, lIdx) => {
                    const lessonCompleted = lesson.isCompleted;
                    const stoppedPosition = lesson.lastPositionInSeconds && lesson.lastPositionInSeconds > 0;

                    return (
                      <Box
                        key={lesson.id || lIdx}
                        sx={{
                          p: 2.25,
                          px: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          '&:hover': { bgcolor: '#F8FAFC' },
                        }}
                      >
                        {/* Right in RTL: Icon + Info */}
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {lessonCompleted ? (
                              <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#10B981' }} />
                            ) : stoppedPosition ? (
                              <Iconify icon="solar:clock-circle-bold" width={20} sx={{ color: '#F59E0B' }} />
                            ) : (
                              <Iconify icon="solar:document-text-bold" width={20} sx={{ color: '#94A3B8' }} />
                            )}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A', mb: 0.25 }}>
                              {lesson.title}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                              {formatSecondsToMinutes(lesson.durationInSeconds)}
                              {stoppedPosition && ` • توقف عند الدقيقة ${formatTimePosition(lesson.lastPositionInSeconds || 0)}`}
                              {lesson.hasTest && ' • يحتوي على اختبار'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Left in RTL: Status Badge */}
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                          <Chip
                            label={
                              lessonCompleted
                                ? 'تمت المشاهدة'
                                : stoppedPosition
                                ? 'قيد المشاهدة'
                                : 'لم يبدأ'
                            }
                            size="small"
                            sx={{
                              bgcolor: lessonCompleted ? '#ECFDF5' : stoppedPosition ? '#FFFBEB' : '#F1F5F9',
                              color: lessonCompleted ? '#059669' : stoppedPosition ? '#D97706' : '#64748B',
                              fontWeight: 700,
                              fontSize: 11.5,
                              height: 24,
                              borderRadius: 1.5,
                            }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}


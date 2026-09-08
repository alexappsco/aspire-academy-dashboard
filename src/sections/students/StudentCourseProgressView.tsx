'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from 'next/link';

import Iconify from 'src/components/iconify';
import { MOCK_COURSE_PROGRESS, MOCK_STUDENTS } from './_mock';

interface Props {
  studentId: string;
  courseId: string;
}

export default function StudentCourseProgressView({ studentId, courseId }: Props) {
  const data = MOCK_COURSE_PROGRESS;
  const student = MOCK_STUDENTS.find((s) => s.id === studentId) || MOCK_STUDENTS[0];

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* Breadcrumbs & Title */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<Iconify icon="solar:alt-arrow-left-linear" width={14} sx={{ color: '#94A3B8' }} />}
          sx={{ mb: 1, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Link href="/students">إدارة الطلاب</Link>
          <Link href={`/students/${student.id}`}>{student.nameAr}</Link>
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
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {data.courseCode}
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
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB' }} />
                      <span>{data.statusText}</span>
                    </Stack>
                  }
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
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
                    الطالب: <strong style={{ color: '#1E293B' }}>{student.nameAr}</strong> ({student.studentCode})
                  </span>
                </Stack>

                <span>•</span>

                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:square-academic-cap-2-bold" width={15} sx={{ color: '#94A3B8' }} />
                  <span>
                    المحاضر المسؤول: <strong style={{ color: '#1E293B' }}>{data.instructorName}</strong>
                  </span>
                </Stack>

                <span>•</span>

                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:calendar-date-bold" width={15} sx={{ color: '#94A3B8' }} />
                  <span>تاريخ التسجيل: {data.enrollmentDate}</span>
                </Stack>
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
                  {data.totalProgressPercent}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                  مستوى متقدم
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={data.totalProgressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#F1F5F9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#2563EB',
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
                {data.completedLessons}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>
                {data.remainingLessonsText}
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
                وقت المشاهدة المسجل
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#F0FDF4', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:clock-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 28 }}>
                  {data.watchTime}
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748B', fontSize: 16, fontWeight: 600 }}>
                  / {data.watchTimeTotal}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                ساعات تدريبية موثقة
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Chapters and Lessons Breakdown */}
      <Stack spacing={2.5}>
        {data.chapters.map((chapter) => {
          const isCompleted = chapter.badgeType === 'completed';

          return (
            <Card
              key={chapter.id}
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
                  bgcolor: isCompleted ? '#F0FDF4' : '#F8FAFC',
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
                        bgcolor: isCompleted ? '#DCFCE7' : '#EFF6FF',
                        color: isCompleted ? '#16A34A' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify
                        icon={isCompleted ? 'solar:check-read-bold' : 'solar:play-circle-bold'}
                        width={18}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                        {chapter.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                        {chapter.subtitle}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={chapter.badgeText}
                    size="small"
                    sx={{
                      bgcolor: isCompleted ? '#DCFCE7' : '#EFF6FF',
                      color: isCompleted ? '#15803D' : '#2563EB',
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
                {chapter.lessons.map((lesson) => {
                  return (
                    <Box
                      key={lesson.id}
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
                          {lesson.isCompleted ? (
                            <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#10B981' }} />
                          ) : lesson.stoppedAt ? (
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
                            {lesson.meta}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Left in RTL: Progress or Badge */}
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                        {lesson.progressPercent !== undefined && (
                          <Box sx={{ width: 100, display: { xs: 'none', sm: 'block' } }}>
                            <LinearProgress
                              variant="determinate"
                              value={lesson.progressPercent}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#F1F5F9',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: '#F59E0B',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        )}

                        <Chip
                          label={lesson.badge}
                          size="small"
                          sx={{
                            bgcolor: lesson.isCompleted ? '#ECFDF5' : lesson.stoppedAt ? '#FFFBEB' : '#F1F5F9',
                            color: lesson.isCompleted ? '#059669' : lesson.stoppedAt ? '#D97706' : '#64748B',
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
    </Box>
  );
}

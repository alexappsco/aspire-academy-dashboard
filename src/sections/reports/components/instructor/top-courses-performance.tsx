'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

import type { CourseStatus, TopCourse } from './types';

const CARD_BORDER = '#E2E8F0';
const PRIMARY = '#00A980';

interface Props {
  topCourses: TopCourse[];
}

function statusMeta(status: CourseStatus, t: (key: string) => string): { label: string; color: string; bg: string } {
  if (status === 'pending_review') {
    return { label: t('status_pending'), color: '#B45309', bg: '#FEF3C7' };
  }
  return { label: t('status_approved'), color: '#047857', bg: '#D1FAE5' };
}

export default function TopCoursesPerformance({ topCourses }: Props) {
  const t = useTranslations('InstructorAnalytics.top_courses');

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        mb: 2.5,
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11, mt: 0.25 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <Typography
          component="span"
          onClick={() => {}}
          sx={{
            color: PRIMARY,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {t('view_report')}
        </Typography>
      </Stack>

      {topCourses.map((course, idx) => {
        const status = statusMeta(course.status, t);
        return (
          <Box
            key={course.id}
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: idx === topCourses.length - 1 ? 'none' : '1px solid #F1F5F9',
              bgcolor: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF',
            }}
          >
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#E6F7F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:book-bookmark-bold" width={20} sx={{ color: PRIMARY }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A', mb: 0.25 }}>
                      {course.title}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                      {t('enrolled', { count: String(course.enrolledStudents) })}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.5 }}>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, mb: 0.5 }}>
                  {t('completion')}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box sx={{ flex: 1, height: 7, borderRadius: 4, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${course.completionPercent}%`,
                        height: '100%',
                        bgcolor: course.progressColor,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#334155', minWidth: 34, textAlign: 'right' }}>
                    {course.completionPercent}%
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 2.5 }}>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, mb: 0.5 }}>
                  {t('total_revenue')}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
                  ${course.totalRevenue.toLocaleString()}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 1.5 }}>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, mb: 0.5 }}>
                  {t('instructor_share')}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY }}>
                  ${course.instructorShare.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                  {t('share_percent', { percent: String(course.instructorSharePercent) })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 1.5 }} sx={{ textAlign: 'right' }}>
                <Chip
                  label={status.label}
                  size="small"
                  sx={{
                    bgcolor: status.bg,
                    color: status.color,
                    fontWeight: 700,
                    fontSize: 10.5,
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Card>
  );
}
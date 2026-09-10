'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import Iconify from 'src/components/iconify';
import type { DashboardTopCourse } from 'src/types/dashboard';
import type { TopInstructor } from 'src/types/reports';

const PRIMARY = '#00A980';
const CARD_BORDER = '#E0E0E0';

interface Props {
  topCourses?: DashboardTopCourse[];
  topInstructors?: TopInstructor[];
}

export default function PerformanceTables({ topCourses, topInstructors }: Props) {
  const tCourses = useTranslations('Reports.performance.top_courses');
  const tInstructors = useTranslations('Reports.performance.instructors');

  const instructorsData = topInstructors ?? [];
  const coursesData = topCourses ?? [];

  const tableHeaderSx = {
    bgcolor: '#F8F9FA',
    py: 1,
    px: 1.25,
    borderBottom: `1px solid ${CARD_BORDER}`,
  };

  const tableCellSx = {
    py: 1.25,
    px: 1.25,
    borderBottom: '1px solid #F1F5F9',
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {/* Instructor Performance Table - LEFT */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
                {tInstructors('title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11 }}>
                {tInstructors('subtitle')}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  {[tInstructors('columns.instructor'), tInstructors('columns.courses_count'), tInstructors('columns.students'), tInstructors('columns.rating'), tInstructors('columns.status')].map((col) => (
                    <Box
                      key={col}
                      component="th"
                      sx={{
                        ...tableHeaderSx,
                        textAlign: 'right',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#9CA3AF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {instructorsData.length > 0 ? (
                  instructorsData.map((row) => (
                    <Box component="tr" key={row.id}>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Avatar
                            src={row.imageUrl ?? undefined}
                            sx={{ width: 32, height: 32, bgcolor: '#E6F7F2', color: PRIMARY, fontSize: 12, fontWeight: 700 }}
                          >
                            {row.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', mb: 0.125 }}>
                              {row.name}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>{row.title}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {row.coursesCount}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {row.studentsCount.toLocaleString()}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                          <Iconify icon="solar:star-bold" width={14} sx={{ color: '#FF9F1C' }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                            {row.ratingAverage > 0 ? row.ratingAverage.toFixed(1) : '—'}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Chip
                          label={tInstructors('published_count', { count: String(row.publishedCoursesCount) })}
                          size="small"
                          sx={{
                            bgcolor: '#E6F7F2',
                            color: PRIMARY,
                            fontWeight: 600,
                            fontSize: 10,
                            height: 22,
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box component="tr">
                    <Box component="td" colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>لا توجد بيانات</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Top Performing Courses Table - RIGHT */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
                {tCourses('title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11 }}>
                {tCourses('subtitle')}
              </Typography>
            </Box>
            <Typography
              component="a"
              href="#"
              sx={{
                color: PRIMARY,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {tCourses('view_report')}
            </Typography>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  {[tCourses('columns.rank'), tCourses('columns.course_and_professor'), tCourses('columns.students'), tCourses('columns.rating')].map((col) => (
                    <Box
                      key={col}
                      component="th"
                      sx={{
                        ...tableHeaderSx,
                        textAlign: 'right',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#9CA3AF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {coursesData.length > 0 ? (
                  coursesData.map((row, idx) => (
                    <Box component="tr" key={row.id}>
                      <Box component="td" sx={{ ...tableCellSx, fontWeight: 700, color: '#1A1A1A', fontSize: 12, textAlign: 'right' }}>
                        {idx + 1}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', mb: 0.125 }}>
                          {row.title}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>{row.specializationName}</Typography>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {row.studentsCount.toLocaleString()}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                          <Iconify icon="solar:star-bold" width={14} sx={{ color: '#FF9F1C' }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                            {row.ratingAverage != null ? row.ratingAverage.toFixed(1) : '—'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box component="tr">
                    <Box component="td" colSpan={4} sx={{ py: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>لا توجد بيانات</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

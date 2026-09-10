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

const PRIMARY = '#00A980';
const CARD_BORDER = '#E0E0E0';

export default function PerformanceTables() {
  const tCourses = useTranslations('Reports.performance.top_courses');
  const tInstructors = useTranslations('Reports.performance.instructors');

  const instructorsData = [
    { name: 'د. أحمد محمد', title: 'استشاري باطنة وقلب', courses: 12, students: '2,450', rating: '4.9', published: 10 },
    { name: 'د. سارة أحمد', title: 'استشاري طب أطفال', courses: 9, students: '1,980', rating: '4.8', published: 8 },
    { name: 'د. محمد علي', title: 'استشاري جراحة عامة', courses: 11, students: '1,750', rating: '4.7', published: 9 },
  ];

  const topCoursesData = [
    { rank: 1, name: 'أساسيات أمراض القلب', specialty: 'الثالثة العامة', instructor: 'د. أحمد محمد', students: '1,245', completion: 87, rating: '4.9' },
    { rank: 2, name: 'الجراحة العامة السريرية', specialty: 'الجراحة', instructor: 'د. محمد علي', students: '1,080', completion: 82, rating: '4.8' },
    { rank: 3, name: 'أمراض وحالات الأطفال', specialty: 'طب الأطفال', instructor: 'د. سارة أحمد', students: '985', completion: 70, rating: '4.7' },
  ];

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
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: `1px solid #F1F5F9` }}
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
                {instructorsData.map((row) => (
                  <Box component="tr" key={row.name}>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar
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
                      {row.courses}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                      {row.students}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                        <Iconify icon="solar:star-bold" width={14} sx={{ color: '#FF9F1C' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                          {row.rating}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Chip
                        label={tInstructors('published_count', { count: String(row.published) })}
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
                ))}
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
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: `1px solid #F1F5F9` }}
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
                  {[tCourses('columns.rank'), tCourses('columns.course_and_professor'), tCourses('columns.students'), tCourses('columns.completion'), tCourses('columns.rating')].map((col) => (
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
                {topCoursesData.map((row) => (
                  <Box component="tr" key={row.rank}>
                    <Box component="td" sx={{ ...tableCellSx, fontWeight: 700, color: '#1A1A1A', fontSize: 12, textAlign: 'right' }}>
                      {row.rank}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', mb: 0.125 }}>
                        {row.name}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>{row.specialty}</Typography>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                      {row.students}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Box sx={{ flex: 1, maxWidth: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.completion}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              bgcolor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: PRIMARY },
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
                          %{row.completion}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                        <Iconify icon="solar:star-bold" width={14} sx={{ color: '#FF9F1C' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                          {row.rating}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

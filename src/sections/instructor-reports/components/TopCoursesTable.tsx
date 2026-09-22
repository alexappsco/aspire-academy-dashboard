'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

import type { InstructorTopCourse } from 'src/types/instructor-reports';

const PRIMARY = '#2563EB';
const CARD_BORDER = '#E0E0E0';

interface Props {
  topCourses?: InstructorTopCourse[];
}

function parseStatus(
  status: string | number | undefined,
  t: (key: string) => string
): { label: string; color: string; bg: string } {
  const s = String(status ?? '').trim();
  if (s === '2' || s.toLowerCase().includes('pending') || s.toLowerCase().includes('review')) {
    return { label: t('status_under_review'), color: '#B45309', bg: '#FEF3C7' };
  }
  if (s === '3' || s.toLowerCase().includes('reject')) {
    return { label: t('status_rejected'), color: '#B91C1C', bg: '#FEE2E2' };
  }
  return { label: t('status_published'), color: '#047857', bg: '#D1FAE5' };
}

export default function TopCoursesTable({ topCourses }: Props) {
  const t = useTranslations('InstructorReports.top_courses');
  const courses = topCourses ?? [];

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

  const columns = [
    t('columns.rank'),
    t('columns.course'),
    t('columns.students'),
    t('columns.completion'),
    t('columns.total_revenue'),
    t('columns.net_revenue'),
    t('columns.status'),
  ];

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
        sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11 }}>
            {t('subtitle')}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <Box component="thead">
            <Box component="tr">
              {columns.map((col) => (
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
            {courses.length > 0 ? (
              courses.map((row, idx) => {
                const status = parseStatus(row.status, t);
                return (
                  <Box component="tr" key={row.id}>
                    <Box component="td" sx={{ ...tableCellSx, fontWeight: 700, color: '#1A1A1A', fontSize: 12, textAlign: 'right' }}>
                      {idx + 1}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                        {row.title}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                      {(row.enrolledStudentsCount ?? 0).toLocaleString()}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 5,
                            borderRadius: 4,
                            bgcolor: '#E2E8F0',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(100, row.completionPercent ?? 0)}%`,
                              height: '100%',
                              bgcolor: PRIMARY,
                              borderRadius: 4,
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>
                          {row.completionPercent ?? 0}%
                        </Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                      ${(row.totalRevenue ?? 0).toLocaleString()}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, fontSize: 12, fontWeight: 700, color: PRIMARY, textAlign: 'right' }}>
                      ${(row.netRevenue ?? 0).toLocaleString()}
                    </Box>
                    <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{
                          bgcolor: status.bg,
                          color: status.color,
                          fontWeight: 600,
                          fontSize: 10,
                          height: 22,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box component="td" colSpan={columns.length} sx={{ py: 4, textAlign: 'center' }}>
                  <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <Iconify icon="solar:book-bookmark-bold" width={28} sx={{ color: '#CBD5E1' }} />
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>{t('empty')}</Typography>
                  </Stack>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
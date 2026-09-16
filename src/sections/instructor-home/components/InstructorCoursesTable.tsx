'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Iconify from 'src/components/iconify';
import type { InstructorCourseRow } from '../types';

interface Props {
  courses: InstructorCourseRow[];
  totalCount?: number;
  onViewAll?: () => void;
  onCourseAction?: (course: InstructorCourseRow) => void;
}

export default function InstructorCoursesTable({
  courses,
  totalCount = 42,
  onViewAll,
  onCourseAction,
}: Props) {
  const t = useTranslations('InstructorHome.courses');

  const getStatusChip = (status: InstructorCourseRow['status'], label: string) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            size="small"
            label={t('status_active')}
            sx={{
              bgcolor: '#D2F9E5',
              color: '#118D57',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'under_review':
        return (
          <Chip
            size="small"
            label={t('status_pending')}
            sx={{
              bgcolor: '#FEF3C7',
              color: '#D97706',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'rejected':
        return (
          <Chip
            size="small"
            label={t('status_rejected')}
            sx={{
              bgcolor: '#FEE2E2',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        bgcolor: '#FFFFFF',
        p: 3,
        mb: 3,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          mb: 2.5,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.1rem' }}>
              {t('title')}
            </Typography>
            <Chip
              label={t('count_badge', { total: totalCount })}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '6px',
                height: 24,
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          onClick={onViewAll}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
          sx={{
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            minWidth: 'auto',
            gap: 0.75,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {t('view_all', { total: totalCount })}
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '1px solid #F1F5F9', color: '#94A3B8', fontWeight: 600, fontSize: '0.8rem', py: 1.5 } }}>
              <TableCell align="right">{t('col_title')}</TableCell>
              <TableCell align="center">{t('col_specialization')}</TableCell>
              <TableCell align="center">{t('col_students')}</TableCell>
              <TableCell align="center">{t('col_rating')}</TableCell>
              <TableCell align="center">{t('col_price')}</TableCell>
              <TableCell align="center">{t('col_status')}</TableCell>
              <TableCell align="center">{t('col_last_updated')}</TableCell>
              <TableCell align="center" sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  '& td': { py: 1.75, borderBottom: '1px solid #F8FAFC' },
                }}
              >
                {/* Title */}
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1C252E' }}>
                    {course.title}
                  </Typography>
                </TableCell>

                {/* Specialization */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                    {course.specialization}
                  </Typography>
                </TableCell>

                {/* Students Count */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
                    {course.studentsCount}
                  </Typography>
                </TableCell>

                {/* Rating */}
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                    <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
                      {course.rating}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Price */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
                    {course.price}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  {getStatusChip(course.status, course.statusText)}
                </TableCell>

                {/* Last updated */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                    {course.lastUpdated}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onCourseAction?.(course)}
                    sx={{ color: '#94A3B8', '&:hover': { color: '#1C252E' } }}
                  >
                    <Iconify icon="solar:menu-dots-bold" width={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Pagination Bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 2,
          mt: 1,
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
            {t('rows_per_page')}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', ml: 2 }}>
            {t('pagination_info')}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" disabled sx={{ color: '#CBD5E1' }}>
            <Iconify icon="solar:alt-arrow-right-linear" width={16} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#64748B' }}>
            <Iconify icon="solar:alt-arrow-left-linear" width={16} />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
}

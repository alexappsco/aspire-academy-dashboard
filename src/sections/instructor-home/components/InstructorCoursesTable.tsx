'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { headCellType, cellAlignment, Action } from 'src/components/SharedTable/types';
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

  const getStatusChip = (status: InstructorCourseRow['status']) => {
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

  const tableHead: headCellType[] = [
    { id: 'title', label: t('col_title'), align: cellAlignment.right },
    { id: 'specialization', label: t('col_specialization'), align: cellAlignment.center },
    { id: 'studentsCount', label: t('col_students'), align: cellAlignment.center },
    { id: 'rating', label: t('col_rating'), align: cellAlignment.center },
    { id: 'price', label: t('col_price'), align: cellAlignment.center },
    { id: 'status', label: t('col_status'), align: cellAlignment.center },
    { id: 'lastUpdated', label: t('col_last_updated'), align: cellAlignment.center },
  ];

  const actions: Action<InstructorCourseRow>[] = [
    {
      label: t('col_title'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row) => onCourseAction?.(row),
    },
  ];

  const customRender = {
    title: (row: InstructorCourseRow) => (
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1C252E' }}>
        {row.title}
      </Typography>
    ),
    specialization: (row: InstructorCourseRow) => (
      <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
        {row.specialization}
      </Typography>
    ),
    studentsCount: (row: InstructorCourseRow) => (
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
        {row.studentsCount}
      </Typography>
    ),
    rating: (row: InstructorCourseRow) => (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
          {row.rating}
        </Typography>
      </Stack>
    ),
    price: (row: InstructorCourseRow) => (
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
        {row.price}
      </Typography>
    ),
    status: (row: InstructorCourseRow) => getStatusChip(row.status),
    lastUpdated: (row: InstructorCourseRow) => (
      <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
        {row.lastUpdated}
      </Typography>
    ),
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

      {/* Shared Table with Pagination aligned to the opposite side */}
      <Box
        sx={{
          '& .MuiTablePagination-toolbar': {
            justifyContent: 'flex-start',
          },
        }}
      >
        <SharedTable<InstructorCourseRow>
          data={courses}
          count={totalCount}
          tableHead={tableHead}
          actions={actions}
          customRender={customRender}
          disablePagination={false}
        />
      </Box>
    </Card>
  );
}

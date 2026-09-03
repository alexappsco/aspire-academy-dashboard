'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import { MOCK_TOP_COURSES } from '../_mock';
import { TopCourseItem } from '../types';

export default function TopCoursesTable() {
  const t = useTranslations('Home.top_courses');
  const router = useRouter();
  const data = MOCK_TOP_COURSES;

  const tableHead = [
    { id: 'course_name', label: t('columns.course_name'), align: cellAlignment.center },
    { id: 'lecturer', label: t('columns.lecturer'), align: cellAlignment.center },
    { id: 'specialty', label: t('columns.specialty'), align: cellAlignment.center },
    { id: 'students', label: t('columns.students'), align: cellAlignment.center, width: 100 },
    { id: 'rating', label: t('columns.rating'), align: cellAlignment.center, width: 100 },
    { id: 'price', label: t('columns.price'), align: cellAlignment.center, width: 100 },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 110 },
    { id: 'last_update', label: t('columns.last_update'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 60 },
  ];

  const customRender = {
    course_name: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.course_name}
      </Typography>
    ),
    lecturer: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
        {row.lecturer}
      </Typography>
    ),
    specialty: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 13, color: '#64748B' }}>
        {row.specialty}
      </Typography>
    ),
    students: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.students.toLocaleString()}
      </Typography>
    ),
    rating: (row: TopCourseItem) => (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          {row.rating}
        </Typography>
      </Stack>
    ),
    price: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.price}
      </Typography>
    ),
    status: (row: TopCourseItem) => (
      <Chip
        label={row.status ? t('active') : t('inactive')}
        size="small"
        sx={{
          bgcolor: row.status ? '#ECFDF5' : '#F1F5F9',
          color: row.status ? '#059669' : '#64748B',
          fontWeight: 700,
          fontSize: 12,
          height: 24,
          borderRadius: 1,
        }}
      />
    ),
    last_update: (row: TopCourseItem) => (
      <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
        {row.last_update}
      </Typography>
    ),
    actions: () => (
      <IconButton size="small" sx={{ color: '#94A3B8' }} onClick={() => router.push('/courses')}>
        <Iconify icon="solar:menu-dots-bold" width={18} />
      </IconButton>
    ),
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        mb: 3,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          p: 2.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => router.push('/courses')}
          startIcon={<Iconify icon="solar:arrow-right-linear" width={16} />}
          sx={{
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: 13,
            px: 2,
            py: 0.75,
            '&:hover': {
              borderColor: '#BFDBFE',
              bgcolor: '#EFF6FF',
            },
          }}
        >
          {t('view_all_btn')}
        </Button>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}
            >
              {t('title')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}
            >
              {t('subtitle')}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:medal-ribbon-star-bold" width={22} />
          </Box>
        </Stack>
      </Stack>

      {/* SharedTable Integration */}
      <Box sx={{ p: 1 }}>
        <SharedTable<TopCourseItem>
          data={data}
          count={data.length}
          tableHead={tableHead}
          customRender={customRender}
          disablePagination={true}
        />
      </Box>
    </Card>
  );
}

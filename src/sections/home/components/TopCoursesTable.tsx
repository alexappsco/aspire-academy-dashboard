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
import type { DashboardTopCourse } from 'src/types/dashboard';

interface Props {
  topCourses?: DashboardTopCourse[];
}

export default function TopCoursesTable({ topCourses }: Props) {
  const t = useTranslations('Home.top_courses');
  const router = useRouter();

  const data = topCourses || [];
  const hasData = topCourses !== undefined && topCourses.length > 0;

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
    course_name: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.title}
      </Typography>
    ),
    lecturer: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
        {row.instructorName || '-'}
      </Typography>
    ),
    specialty: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 13, color: '#64748B' }}>
        {row.specializationName || '-'}
      </Typography>
    ),
    students: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.studentsCount?.toLocaleString() ?? 0}
      </Typography>
    ),
    rating: (row: DashboardTopCourse) => (
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          {row.ratingAverage || 0}
        </Typography>
      </Stack>
    ),
    price: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.price || 0}
      </Typography>
    ),
    status: (row: DashboardTopCourse) => {
      const statusStr = String(row.status || '');
      const isPublished = statusStr.toLowerCase().includes('publish') || statusStr === '2';
      return (
        <Chip
          label={statusStr || (isPublished ? t('active') : t('inactive'))}
          size="small"
          sx={{
            bgcolor: isPublished ? '#ECFDF5' : '#F1F5F9',
            color: isPublished ? '#059669' : '#64748B',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1,
          }}
        />
      );
    },
    last_update: (row: DashboardTopCourse) => (
      <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
        {row.lastUpdatedAt ? new Date(row.lastUpdatedAt).toLocaleDateString() : '-'}
      </Typography>
    ),
    actions: (row: DashboardTopCourse) => (
      <IconButton
        size="small"
        sx={{ color: '#94A3B8' }}
        onClick={() => router.push(`/courses`)}
      >
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
        {/* Right in RTL: Icon & Title */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
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

          <Box>
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
        </Stack>

        {/* Left in RTL: View All Courses Button */}
        <Button
          variant="outlined"
          onClick={() => router.push('/courses')}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} sx={{ ml: 0.5 }} />}
          sx={{
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: 13,
            px: 2,
            py: 0.75,
            gap: 1,
            '&:hover': {
              borderColor: '#BFDBFE',
              bgcolor: '#EFF6FF',
            },
          }}
        >
          {t('view_all_btn')}
        </Button>
      </Stack>

      {/* Table Section */}
      <Box sx={{ p: 1 }}>
        {hasData ? (
          <SharedTable<DashboardTopCourse>
            data={data}
            count={data.length}
            tableHead={tableHead}
            customRender={customRender}
            disablePagination={true}
          />
        ) : (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              bgcolor: '#F8FAFC',
              borderRadius: 2,
              m: 1,
            }}
          >
            <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
              No data from backend
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

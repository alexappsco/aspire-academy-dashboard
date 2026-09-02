'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { EnrollmentItem } from '../types';

interface RecentEnrollmentsTableProps {
  enrollments: EnrollmentItem[];
  onViewAll?: () => void;
}

export default function RecentEnrollmentsTable({
  enrollments,
  onViewAll,
}: RecentEnrollmentsTableProps) {
  const t = useTranslations('CourseDetails.recent_enrollments');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const tableHead = [
    {
      id: 'name',
      label: t('columns.name'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'joinDate',
      label: t('columns.join_date'),
      align: 'center' as cellAlignment,
    },
    {
      id: 'progress',
      label: t('columns.progress'),
      align: 'center' as cellAlignment,
    },
    {
      id: 'status',
      label: t('columns.status'),
      align: 'center' as cellAlignment,
    },
  ];

  const customRender = {
    name: (row: EnrollmentItem) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          src={row.avatarUrl}
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#EFF6FF',
            color: '#3B82F6',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {row.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
            {row.email}
          </Typography>
        </Box>
      </Stack>
    ),
    joinDate: (row: EnrollmentItem) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.joinDate}
      </Typography>
    ),
    progress: (row: EnrollmentItem) => {
      const isCompleted = row.progress === 100;
      return (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', minWidth: 35 }}>
            {row.progress}%
          </Typography>
          <Box sx={{ width: 65 }}>
            <LinearProgress
              variant="determinate"
              value={row.progress}
              sx={{
                height: 5,
                borderRadius: 2.5,
                bgcolor: '#E2E8F0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isCompleted ? '#10B981' : '#2563EB',
                  borderRadius: 2.5,
                },
              }}
            />
          </Box>
        </Stack>
      );
    },
    status: (row: EnrollmentItem) => {
      const isCompleted = row.status === 'completed';
      return (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.4,
            borderRadius: 1.5,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: isCompleted ? '#ECFDF5' : '#EFF6FF',
            color: isCompleted ? '#10B981' : '#3B82F6',
          }}
        >
          {isCompleted ? t('statuses.completed') : t('statuses.in_progress')}
        </Box>
      );
    },
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        p: { xs: 2, sm: 2.5 },
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Table Card Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          px: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 17 }}>
          {t('title')}
        </Typography>

        <Link
          component="button"
          onClick={onViewAll}
          underline="hover"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0284C7',
            cursor: 'pointer',
          }}
        >
          {t('view_all')}
        </Link>
      </Box>

      {/* SharedTable Component */}
      <Box sx={{ px: 0.5 }}>
        <SharedTable<EnrollmentItem>
          data={enrollments}
          count={enrollments.length}
          tableHead={tableHead}
          customRender={customRender}
          disablePagination
        />
      </Box>
    </Card>
  );
}

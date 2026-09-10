'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import Iconify from 'src/components/iconify';
import { EnrollmentItem } from '../types';

interface CourseStudentsTabProps {
  enrollments: EnrollmentItem[];
}

const FULL_ENROLLMENTS: EnrollmentItem[] = [
  {
    id: 'enr-1',
    name: 'أحمد محمد علي',
    email: 'ahmed.ali@example.com',
    avatarUrl: '/avatars/avatar_1.jpg',
    joinDate: '05-08-2026',
    progress: 45,
    status: 'in_progress',
  },
  {
    id: 'enr-2',
    name: 'سارة خالد المنصور',
    email: 'sara.k@example.com',
    avatarUrl: '/avatars/avatar_2.jpg',
    joinDate: '05-08-2026',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'enr-3',
    name: 'محمد إبراهيم يوسف',
    email: 'm.ibrahim@example.com',
    avatarUrl: '/avatars/avatar_3.jpg',
    joinDate: '05-08-2026',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'enr-4',
    name: 'فاطمة الزهراء حسن',
    email: 'fatima.z@example.com',
    avatarUrl: '/avatars/avatar_4.jpg',
    joinDate: '04-08-2026',
    progress: 60,
    status: 'in_progress',
  },
  {
    id: 'enr-5',
    name: 'عبدالله ناصر العتيبي',
    email: 'abdullah.n@example.com',
    avatarUrl: '/avatars/avatar_5.jpg',
    joinDate: '03-08-2026',
    progress: 80,
    status: 'in_progress',
  },
  {
    id: 'enr-6',
    name: 'نورة سعد المطيري',
    email: 'noura.s@example.com',
    avatarUrl: '/avatars/avatar_6.jpg',
    joinDate: '01-08-2026',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'enr-7',
    name: 'يوسف جمال الدين',
    email: 'youssef.g@example.com',
    avatarUrl: '/avatars/avatar_7.jpg',
    joinDate: '28-07-2026',
    progress: 20,
    status: 'in_progress',
  },
];

export default function CourseStudentsTab({ enrollments }: CourseStudentsTabProps) {
  const [data] = useState<EnrollmentItem[]>(
    enrollments && enrollments.length > 0 ? enrollments : FULL_ENROLLMENTS
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = data.length;
  const completedCount = data.filter((d) => d.status === 'completed').length;
  const inProgressCount = data.filter((d) => d.status === 'in_progress').length;

  const tableHead = [
    {
      id: 'name',
      label: 'الطالب',
      align: 'right' as cellAlignment,
    },
    {
      id: 'joinDate',
      label: 'تاريخ الانضمام',
      align: 'center' as cellAlignment,
    },
    {
      id: 'progress',
      label: 'نسبة الإنجاز',
      align: 'center' as cellAlignment,
    },
    {
      id: 'status',
      label: 'الحالة',
      align: 'center' as cellAlignment,
    },
    {
      id: 'actions',
      label: 'الإجراءات',
      align: 'center' as cellAlignment,
    },
  ];

  const customRender = {
    name: (row: EnrollmentItem) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          src={row.avatarUrl}
          sx={{
            width: 38,
            height: 38,
            bgcolor: '#EFF6FF',
            color: '#0284C7',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {row.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>{row.email}</Typography>
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
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', minWidth: 35 }}>
            {row.progress}%
          </Typography>
          <Box sx={{ width: 80 }}>
            <LinearProgress
              variant="determinate"
              value={row.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#E2E8F0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isCompleted ? '#10B981' : '#0284C7',
                  borderRadius: 3,
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
            color: isCompleted ? '#10B981' : '#0284C7',
          }}
        >
          {isCompleted ? 'مكتمل' : 'قيد التقدم'}
        </Box>
      );
    },
    actions: () => (
      <IconButton size="small" sx={{ color: '#64748B' }}>
        <Iconify icon="eva:more-vertical-fill" width={18} />
      </IconButton>
    ),
  };

  return (
    <Stack spacing={3}>
      {/* 1. Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F3F5',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: '#EFF6FF',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:users-group-two-rounded-bold" width={24} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                  إجمالي المسجلين
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
                  8,543 طالب
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F3F5',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={24} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                  أتموا الكورس
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
                  6,150 طالب
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F3F5',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: '#FFF7ED',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:chart-2-bold" width={24} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                  معدل الإكمال العام
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
                  72%
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Main Students Table Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Table Filter Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 2.5,
          }}
        >
          <TextField
            size="small"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 320 },
              bgcolor: '#F8FAFC',
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'in_progress' | 'completed')
              }
              sx={{
                width: 160,
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            >
              <MenuItem value="all">كل الحالات ({totalCount})</MenuItem>
              <MenuItem value="in_progress">قيد التقدم ({inProgressCount})</MenuItem>
              <MenuItem value="completed">مكتمل ({completedCount})</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        {/* SharedTable */}
        <SharedTable<EnrollmentItem>
          data={filteredData}
          count={filteredData.length}
          tableHead={tableHead}
          customRender={customRender}
          disablePagination
        />
      </Card>
    </Stack>
  );
}

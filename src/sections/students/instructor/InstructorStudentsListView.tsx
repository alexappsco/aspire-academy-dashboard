'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations, useLocale } from 'next-intl';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import SelectField from 'src/components/SelectField/SelectField';
import { useRouter } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';
import { getInstructorStudentsAction } from 'src/actions/instructor-students';
import { getCourses } from 'src/actions/courses';
import type { InstructorStudentItemDto } from 'src/types/instructor-student';
import type { CourseDto } from 'src/types/course';

export default function InstructorStudentsListView() {
  const t = useTranslations('InstructorStudents');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const isRtl = locale === 'ar';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courses, setCourses] = useState<CourseDto[]>([]);


  // Data state
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<InstructorStudentItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // Load instructor's courses for the filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses({ SkipCount: 0, MaxResultCount: 200 });
        if (res.success && res.data) {
          setCourses(res.data.items || []);
        }
      } catch (err) {
        console.error('Failed to load courses for filter:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInstructorStudentsAction({
        Filter: debouncedSearch.trim() || undefined,
        CourseId: selectedCourseId || undefined,
        SkipCount: 0,
        MaxResultCount: 1000,
      });

      if (res.success && res.data) {
        setStudents(res.data.items || []);
        setTotalCount(res.data.totalCount ?? (res.data.items?.length || 0));
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch (err) {
      console.error('Failed to load instructor students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCourseId, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Table Columns
  const tableHead = [
    {
      id: 'name',
      label: t('columns.name'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'coursesCount',
      label: t('columns.courses_count'),
      align: 'center' as cellAlignment,
      width: 140,
    },
    {
      id: 'lastEnrolledAt',
      label: t('columns.last_enrolled'),
      align: 'center' as cellAlignment,
      width: 180,
    },
  ];

  // Table Actions
  const actions = [
    {
      label: t('actions.view'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row: InstructorStudentItemDto) => {
        router.push(`/students/${row.studentId}`);
      },
    },
  ];

  // Custom renders
  const customRender = {
    name: (row: InstructorStudentItemDto) => (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', cursor: 'pointer' }}
        onClick={() => router.push(`/students/${row.studentId}`)}
      >
        <Avatar
          src={row.imageUrl || undefined}
          alt={row.name}
          sx={{
            width: 42,
            height: 42,
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: '1px solid #E2E8F0',
          }}
        >
          {row.name ? row.name.slice(0, 2).toUpperCase() : 'ST'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#1C252E',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {row.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#637381',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {row.email}
          </Typography>
        </Box>
      </Stack>
    ),
    coursesCount: (row: InstructorStudentItemDto) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C252E' }}>
        {row.coursesCount ?? 0}
      </Typography>
    ),
    lastEnrolledAt: (row: InstructorStudentItemDto) => (
      <Typography variant="body2" sx={{ color: '#637381', fontSize: '0.85rem' }}>
        {formatDate(row.lastEnrolledAt)}
      </Typography>
    ),
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C252E' }}>
            {t('title')}
          </Typography>
        </Box>
      </Stack>

      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}
      >
        {/* Filters bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2.5, alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Search Box */}
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            sx={{ maxWidth: { sm: 380 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Course Filter Dropdown */}
          <Box sx={{ width: { xs: '100%', sm: 260 } }}>
            <SelectField
              fullWidth
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value as string);
              }}
            >
              <MenuItem value="">{t('course_filter_all')}</MenuItem>
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.title}
                </MenuItem>
              ))}
            </SelectField>
          </Box>
        </Stack>

        {/* Loading / Table / Empty */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#919EAB' }}>
            <Iconify icon="solar:users-group-rounded-bold" width={56} sx={{ mb: 1, opacity: 0.4 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {t('empty')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 0.5 }}>
            <SharedTable<InstructorStudentItemDto>
              data={students}
              count={students.length}
              tableHead={tableHead}
              actions={actions}
              customRender={customRender}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}

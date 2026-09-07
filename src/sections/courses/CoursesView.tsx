'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getCourses, deleteCourse } from 'src/actions/courses';
import type { CourseDto, GetCoursesParams } from 'src/types/course';

interface FormattedCourse {
  id: string;
  title: string;
  lecturer: string;
  specialty: string;
  students: number | string;
  rating: number;
  price: string;
  status: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  lastUpdate: string;
  raw: CourseDto;
}

export default function CoursesView() {
  const t = useTranslations('Courses');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseDto | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Fetch courses from backend API
  const fetchCoursesData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params: GetCoursesParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim()) {
          params.Filter = debouncedSearch.trim();
        }

        if (selectedStatus === 'active') {
          params.IsActive = true;
        } else if (selectedStatus === 'paused') {
          params.IsActive = false;
        }

        const res = await getCourses(params);

        if (res.success && res.data) {
          setCourses(res.data.items || []);
          setTotalCount(res.data.totalCount || 0);
        } else {
          toast.error(res.error || 'Failed to load courses');
        }
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, selectedStatus, toast]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchCoursesData(true);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchCoursesData]);

  // Format backend CourseDto for SharedTable
  const formattedData: FormattedCourse[] = courses.map((item) => {
    const lecturerName = item.instructor?.name || '-';

    const specialtyName = item.specialization?.name || item.field?.name || item.faculty?.name || '-';

    const currencySymbol = item.currency?.symbol || item.currency?.code || 'د.ك';
    const priceDisplay = `${item.price || 0} ${currencySymbol}`;

    // Last Update: uses lastUpdatedAt from API, or reviewedAt / modification / creation dates
    const dateStr = item.lastUpdatedAt || item.reviewedAt || item.lastModificationTime || item.creationTime;
    const lastUpdateFormatted = dateStr
      ? new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '-';

    // Students Count: reads studentsCount, or instructor studentsCount, otherwise '-'
    let studentsDisplay: number | string = '-';
    if (typeof item.studentsCount === 'number') {
      studentsDisplay = item.studentsCount;
    } else if (typeof item.instructor?.studentsCount === 'number') {
      studentsDisplay = item.instructor.studentsCount;
    }

    // Rating: reads ratingAverage from course root, or rating, or instructor ratingAverage, default 0
    const ratingValue = item.ratingAverage ?? item.rating ?? item.instructor?.ratingAverage ?? 0;

    // Status mapping (handles string or numeric enum from backend)
    const rawStatus = String(item.status ?? '').trim().toLowerCase();
    let statusLabel = t('status.active');
    let statusBg = '#E6F4EA';
    let statusColor = '#137333';

    if (rawStatus === 'pending' || rawStatus === '0') {
      statusLabel = 'قيد المراجعة';
      statusBg = '#FFF4E5';
      statusColor = '#B76E00';
    } else if (rawStatus === 'rejected' || rawStatus === '3') {
      statusLabel = 'مرفوض';
      statusBg = '#FCE8E6';
      statusColor = '#C5221F';
    } else if (rawStatus === 'paused' || rawStatus === '2' || item.isActive === false) {
      statusLabel = t('status.paused');
      statusBg = '#FCE8E6';
      statusColor = '#C5221F';
    } else {
      statusLabel = t('status.active');
      statusBg = '#E6F4EA';
      statusColor = '#137333';
    }

    return {
      id: item.id,
      title: item.title || (isRtl ? item.titleAr : item.titleEn) || '',
      lecturer: lecturerName,
      specialty: specialtyName,
      students: studentsDisplay,
      rating: ratingValue,
      price: priceDisplay,
      status: String(item.status ?? (item.isActive !== false ? 'active' : 'paused')),
      statusLabel,
      statusBg,
      statusColor,
      lastUpdate: lastUpdateFormatted,
      raw: item,
    };
  });

  // Client-side additional filters (Category / Price)
  const filteredData = formattedData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'cardiology' && item.specialty.includes('القلب')) ||
      (selectedCategory === 'neurology' && item.specialty.includes('الأعصاب'));

    const numericPrice = parseFloat(item.price) || 0;
    const matchesPrice =
      selectedPrice === 'all' ||
      (selectedPrice === 'under_200' && numericPrice < 200) ||
      (selectedPrice === 'above_200' && numericPrice >= 200);

    return matchesCategory && matchesPrice;
  });

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      const res = await deleteCourse(courseToDelete.id);
      if (res.success) {
        toast.success('تم حذف الدورة بنجاح');
        fetchCoursesData(false);
      } else {
        toast.error(res.error || 'فشل في حذف الدورة');
      }
    } catch {
      toast.error('فشل في حذف الدورة');
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  // Table columns definition
  const tableHead = [
    { id: 'title', label: t('columns.course_name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'lecturer', label: t('columns.lecturer'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'specialty', label: t('columns.specialty'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'students', label: t('columns.students'), align: 'center' as cellAlignment },
    { id: 'rating', label: t('columns.rating'), align: 'center' as cellAlignment },
    { id: 'price', label: t('columns.price'), align: 'center' as cellAlignment },
    { id: 'status', label: t('columns.status'), align: 'center' as cellAlignment },
    { id: 'lastUpdate', label: t('columns.last_update'), align: (isRtl ? 'right' : 'left') as cellAlignment },
  ];

  // Actions for three-dots menu
  const actions = [
    {
      label: t('actions.view'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row: FormattedCourse) => router.push(`/courses/${row.id}`),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedCourse) => {
        setCourseToDelete(row.raw);
        setDeleteDialogOpen(true);
      },
    },
  ];

  // Custom renders for table cells
  const customRender = {
    title: (row: FormattedCourse) => (
      <Typography
        variant="subtitle2"
        onClick={() => router.push(`/courses/${row.id}`)}
        sx={{
          cursor: 'pointer',
          fontWeight: 700,
          color: '#1C252E',
          '&:hover': { color: '#0284C7', textDecoration: 'underline' },
        }}
      >
        {row.title}
      </Typography>
    ),
    rating: (row: FormattedCourse) => (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Iconify icon="eva:star-fill" sx={{ color: '#FFB400', width: 16, height: 16 }} />
        <Typography variant="body2" sx={{ color: '#FFB400', fontWeight: 600 }}>
          {row.rating.toFixed(1)}
        </Typography>
      </Box>
    ),
    status: (row: FormattedCourse) => (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          bgcolor: row.statusBg,
          color: row.statusColor,
        }}
      >
        {row.statusLabel}
      </Box>
    ),
    students: (row: FormattedCourse) => (
      <Typography variant="body2">
        {typeof row.students === 'number'
          ? row.students.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          : row.students}
      </Typography>
    ),
    price: (row: FormattedCourse) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
        {row.price}
      </Typography>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => router.push('/courses/new')}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('add_course')}
        </Button>
      </Stack>

      {/* Main card containing filter row and table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filters and search row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2.5, borderBottom: '1px dashed #F1F3F5' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 500 } }}>
            <SelectField
              fullWidth
              size="small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('categories.all')}</MenuItem>
              <MenuItem value="cardiology">{t('categories.cardiology')}</MenuItem>
              <MenuItem value="neurology">{t('categories.neurology')}</MenuItem>
            </SelectField>

            <SelectField
              fullWidth
              size="small"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('prices.all')}</MenuItem>
              <MenuItem value="under_200">{t('prices.under_200')}</MenuItem>
              <MenuItem value="above_200">{t('prices.above_200')}</MenuItem>
            </SelectField>

            <SelectField
              fullWidth
              size="small"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('statuses.all')}</MenuItem>
              <MenuItem value="active">{t('statuses.active')}</MenuItem>
              <MenuItem value="paused">{t('statuses.paused')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedCourse>
            data={filteredData}
            count={totalCount || filteredData.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1.5, textAlign: 'center' },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
          <IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 2, fontSize: 18 }}>
            حذف الدورة التدريبية
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 4, fontSize: 14 }}>
            هل أنت متأكد من رغبتك في حذف هذه الدورة التدريبية؟ لا يمكن التراجع عن هذا الإجراء.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleDeleteConfirm}
              sx={{
                bgcolor: '#D32F2F',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: 14,
                minWidth: 100,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#C62828' },
              }}
            >
              حذف
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748B',
                borderRadius: 1.5,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: 14,
                minWidth: 100,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              إلغاء
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

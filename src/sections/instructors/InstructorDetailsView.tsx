'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import {
  getInstructorById,
  getInstructorReviews,
  getInstructorOrders,
  getInstructorCourses,
} from 'src/actions/instructors';
import type {
  Instructor,
  InstructorCourseApiResponse,
  InstructorOrderApiResponse,
  InstructorReviewApiResponse,
} from 'src/types/instructor';
import PaymentReceiptDialog from 'src/sections/students/PaymentReceiptDialog';

interface Props {
  instructorId?: string;
}

function formatDate(date?: string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2);
}

function getCourseStatus(status: string): { label: string; active: boolean } {
  const map: Record<string, { label: string; active: boolean }> = {
    Approved: { label: 'نشط', active: true },
    Active: { label: 'نشط', active: true },
    Published: { label: 'نشط', active: true },
    Pending: { label: 'قيد المراجعة', active: false },
    Rejected: { label: 'مرفوض', active: false },
    Suspended: { label: 'متوقف', active: false },
  };
  return map[status] ?? { label: status, active: false };
}

function getOrderStatusLabel(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    Completed: { label: 'مكتمل', color: '#059669', bg: '#ECFDF5' },
    Paid: { label: 'مدفوع', color: '#059669', bg: '#ECFDF5' },
    Pending: { label: 'قيد الانتظار', color: '#B45309', bg: '#FEF3C7' },
    Cancelled: { label: 'ملغي', color: '#E11D48', bg: '#FFF1F2' },
    Refunded: { label: 'مسترجع', color: '#E11D48', bg: '#FFF1F2' },
  };
  return map[status] ?? { label: status, color: '#64748B', bg: '#EDF2F7' };
}

export default function InstructorDetailsView({ instructorId }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<'courses' | 'subscriptions' | 'reviews'>('courses');

  // Sub-data states
  const [courses, setCourses] = useState<InstructorCourseApiResponse[]>([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [orders, setOrders] = useState<InstructorOrderApiResponse[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [reviews, setReviews] = useState<InstructorReviewApiResponse[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [loadingTab, setLoadingTab] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Course actions menu
  const [courseAnchorEl, setCourseAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourseApiResponse | null>(null);

  // Receipt dialog
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InstructorOrderApiResponse | null>(null);

  // Debounce search
  useEffect(() => {
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Fetch instructor profile
  useEffect(() => {
    if (!instructorId) return;
    let active = true;
    (async () => {
      try {
        const res = await getInstructorById(instructorId);
        if (active && res.success && res.data) setInstructor(res.data);
      } catch {
        if (active) toast.error('Failed to load instructor');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [instructorId, toast]);

  // Fetch tab data
  const fetchTabData = useCallback(async () => {
    if (!instructorId) return;
    setLoadingTab(true);
    try {
      const params = { SkipCount: page * rowsPerPage, MaxResultCount: rowsPerPage };

      if (currentTab === 'courses') {
        const res = await getInstructorCourses(instructorId, params);
        if (res.success && res.data) {
          setCourses(res.data.items);
          setCoursesTotal(res.data.totalCount);
        }
      } else if (currentTab === 'subscriptions') {
        const res = await getInstructorOrders(instructorId, params);
        if (res.success && res.data) {
          setOrders(res.data.items);
          setOrdersTotal(res.data.totalCount);
        }
      } else if (currentTab === 'reviews') {
        const res = await getInstructorReviews(instructorId, params);
        if (res.success && res.data) {
          setReviews(res.data.items);
          setReviewsTotal(res.data.totalCount);
        }
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoadingTab(false);
    }
  }, [instructorId, currentTab, page, rowsPerPage, toast]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // Reset page when tab/search changes
  useEffect(() => {
    setPage(0);
  }, [currentTab, debouncedSearch, statusFilter]);

  const handleOpenCourseMenu = (e: React.MouseEvent<HTMLElement>, course: InstructorCourseApiResponse) => {
    setCourseAnchorEl(e.currentTarget);
    setSelectedCourse(course);
  };

  const handleCloseCourseMenu = () => {
    setCourseAnchorEl(null);
    setSelectedCourse(null);
  };

  // Client-side filter for search (API doesn't support full-text search on sub-endpoints)
  const filteredCourses = courses.filter((c) => {
    if (statusFilter !== 'all') {
      const st = getCourseStatus(c.status);
      const map: Record<string, string> = { active: 'Approved', paused: 'Suspended', pending: 'Pending' };
      if (c.status !== map[statusFilter] && statusFilter !== 'all') return false;
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) && !c.specialization?.name?.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all' && c.specialization?.name !== categoryFilter) return false;
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all') {
      const map: Record<string, string> = { active: 'Completed', paused: 'Cancelled', pending: 'Pending' };
      if (o.status !== map[statusFilter]) return false;
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      if (!o.buyerName?.toLowerCase().includes(q) && !o.buyerEmail?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredReviews = reviews.filter((r) => {
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      if (!r.studentName?.toLowerCase().includes(q) && !r.courseTitle?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const isActiveAccount = instructor ? !!instructor.verifiedAt : true;

  const profileTitle = instructor?.title ?? '-';
  const profileEmail = instructor?.email ?? '-';
  const profilePhone = instructor?.phoneNumber ?? '-';
  const profileCountry = instructor?.country?.name ?? '-';
  const profileUniversity = instructor?.university?.nameAr ?? instructor?.university?.nameEn ?? '-';
  const profileQualification = instructor?.educationalQualification ?? '-';
  const profileBio = instructor?.bio ?? '-';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!instructor) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Instructor not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Profile Header */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          mb: 2.5,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start', gap: 2.5 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={instructor.imageUrl ?? undefined}
                alt={instructor.name}
                sx={{
                  width: { xs: 68, md: 78 },
                  height: { xs: 68, md: 78 },
                  borderRadius: 2.5,
                  bgcolor: '#ECFDF5',
                  color: '#00A76F',
                  border: '1.5px solid #A7F3D0',
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                <Iconify icon="solar:user-bold" width={38} sx={{ color: '#00A76F' }} />
              </Avatar>
              <Box sx={{ position: 'absolute', bottom: -8, right: '50%', transform: 'translateX(50%)', whiteSpace: 'nowrap' }}>
                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FFFFFF' }} />
                      <span>{isActiveAccount ? 'نشط / مفعل' : 'معطل'}</span>
                    </Stack>
                  }
                  size="small"
                  sx={{
                    bgcolor: isActiveAccount ? '#00A76F' : '#94A3B8',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 10.5,
                    height: 20,
                    borderRadius: 1,
                    px: 0.5,
                    boxShadow: '0 2px 6px rgba(0, 167, 111, 0.25)',
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ pt: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 18, md: 22 }, mb: 0.5 }}>
                {instructor.name}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 13.5, fontWeight: 600, mb: 0.75 }}>
                {profileTitle}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13.5 }}>
                  {instructor.ratingAverage ?? 0}
                </Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: 12.5, fontWeight: 500 }}>
                  ({reviewsTotal} تقييم من الطلاب)
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => router.push(`/minutes-management/${instructor.id}`)}
              startIcon={<Iconify icon="solar:pen-bold" width={16} />}
              sx={{
                gap: 1, '& .MuiButton-startIcon': { m: 0 }, bgcolor: '#0F172A', color: '#FFFFFF',
                fontWeight: 700, fontSize: 13.5, px: 2.5, py: 0.9, borderRadius: 2, boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              تعديل البيانات
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 2. Info Cards */}
      <Grid container spacing={1.75} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>تاريخ الانضمام</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700 }}>{formatDate(instructor.startJobAt)}</Typography>
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:calendar-date-bold" width={18} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', overflow: 'hidden' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>البريد الإلكتروني</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{profileEmail}</Typography>
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:letter-bold" width={18} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>رقم الهاتف</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>{profilePhone}</Typography>
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:phone-bold" width={18} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>الدولة والجامعة</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700 }}>{profileCountry} — {profileUniversity}</Typography>
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:buildings-2-bold" width={18} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>المؤهل العلمي</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700 }}>{profileQualification}</Typography>
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:diploma-bold" width={18} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Bio */}
      <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', mb: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>النبذة المهنية:</Typography>
        </Stack>
        <Typography sx={{ color: '#475569', fontSize: 13, lineHeight: 1.75, fontWeight: 500 }}>{profileBio}</Typography>
      </Card>

      {/* 4. KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2.25, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, mb: 0.25 }}>إجمالي الدورات</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, my: 0.25, lineHeight: 1.2 }}>{coursesTotal}</Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#E6F8F3', color: '#00A76F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:book-2-linear" width={22} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2.25, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, mb: 0.25 }}>إجمالي الطلبات</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, my: 0.25, lineHeight: 1.2 }}>{ordersTotal}</Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:users-group-rounded-linear" width={22} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2.25, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, mb: 0.25 }}>التقييمات</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, my: 0.25, lineHeight: 1.2 }}>{reviewsTotal}</Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:smile-circle-bold" width={22} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2.25, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, mb: 0.25 }}>متوسط التقييم</Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75, my: 0.25 }}>
                <Iconify icon="solar:star-bold" width={18} sx={{ color: '#F59E0B' }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, lineHeight: 1.2 }}>{instructor.ratingAverage ?? 0}</Typography>
              </Stack>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:star-bold" width={22} />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2.25, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, mb: 0.25 }}>الطلاب</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, my: 0.25, lineHeight: 1.2 }}>{orders.reduce((sum, o) => sum + o.items.length, 0)}</Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#E6F8F3', color: '#00A76F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Iconify icon="solar:dollar-circle-linear" width={22} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Tabs */}
      <Box sx={{ mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => { setCurrentTab(val); setPage(0); setSearchQuery(''); setDebouncedSearch(''); setStatusFilter('all'); }}
          sx={{
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTabs-flexContainer': { gap: { xs: 3, sm: 5, md: 7 } },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab
            value="courses"
            label={<Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1.25 }}><Iconify icon="solar:archive-minimalistic-line" width={20} /><span>الدورات ({coursesTotal})</span></Stack>}
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 52, px: 1, color: '#475569', '&.Mui-selected': { color: '#2563EB' } }}
          />
          <Tab
            value="subscriptions"
            label={<Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1.25 }}><Iconify icon="solar:clipboard-check-outline" width={20} /><span>طلبات الاشتراك ({ordersTotal})</span></Stack>}
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 52, px: 1, color: '#475569', '&.Mui-selected': { color: '#2563EB' } }}
          />
          <Tab
            value="reviews"
            label={<Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1.25 }}><Iconify icon="solar:star-outline" width={20} /><span>التقييمات ({reviewsTotal})</span></Stack>}
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 52, px: 1, color: '#475569', '&.Mui-selected': { color: '#2563EB' } }}
          />
        </Tabs>
      </Box>

      {/* 6. Content Card */}
      <Card sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        {/* Filter Bar */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5, alignItems: 'center', gap: 2, borderBottom: '1px solid #F1F5F9' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={currentTab === 'courses' ? 'بحث في الدورات...' : currentTab === 'subscriptions' ? 'بحث في الطلبات...' : 'بحث في التقييمات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} /></InputAdornment>),
                endAdornment: searchQuery ? (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><Iconify icon="solar:close-circle-bold" width={16} sx={{ color: '#94A3B8' }} /></IconButton></InputAdornment>) : null,
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E2E8F0' } } }}
          />
          <Stack direction="row" spacing={1.5} sx={{ gap: 1.5, flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
            {currentTab === 'courses' && (
              <FormControl size="small" sx={{ minWidth: { xs: '30%', md: 130 } }}>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13, fontWeight: 600, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' } }}>
                  <MenuItem value="all">التصنيف</MenuItem>
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: { xs: '30%', md: 120 } }}>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13, fontWeight: 600, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' } }}>
                <MenuItem value="all">الحالة</MenuItem>
                {currentTab === 'courses' && <MenuItem value="active">نشط</MenuItem>}
                {currentTab === 'courses' && <MenuItem value="paused">متوقف</MenuItem>}
                {currentTab === 'subscriptions' && <MenuItem value="active">مدفوع</MenuItem>}
                {currentTab === 'subscriptions' && <MenuItem value="pending">قيد الانتظار</MenuItem>}
                {currentTab === 'subscriptions' && <MenuItem value="paused">ملغي</MenuItem>}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* Loading */}
        {loadingTab && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Courses Tab */}
        {!loadingTab && currentTab === 'courses' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 13, fontWeight: 700, textAlign: 'center' } }}>
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>اسم الدورة</Box>
                  <Box component="th">التخصص</Box>
                  <Box component="th">الطلاب</Box>
                  <Box component="th">التقييم</Box>
                  <Box component="th">السعر</Box>
                  <Box component="th">الحالة</Box>
                  <Box component="th">اخر تحديث</Box>
                  <Box component="th" sx={{ width: 60 }}>{'\u22EE'}</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {filteredCourses.map((course) => {
                  const cs = getCourseStatus(course.status);
                  return (
                    <Box component="tr" key={course.id} sx={{ borderBottom: '1px solid #F1F5F9', '&:hover': { bgcolor: '#F8FAFC' }, '& td': { p: 2, fontSize: 13, textAlign: 'center' } }}>
                      <Box component="td" sx={{ textAlign: 'right !important', pr: 3, fontWeight: 800, color: '#0F172A' }}>{course.title}</Box>
                      <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>{course.specialization?.name ?? '-'}</Box>
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>{course.studentsCount}</Box>
                      <Box component="td">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>{course.ratingAverage}</Typography>
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 800 }}>{course.price}</Box>
                      <Box component="td">
                        <Chip label={cs.label} size="small" sx={{ bgcolor: cs.active ? '#ECFDF5' : '#FFF1F2', color: cs.active ? '#059669' : '#E11D48', fontWeight: 700, fontSize: 12, height: 24, borderRadius: 1.5, px: 1 }} />
                      </Box>
                      <Box component="td" sx={{ color: '#64748B', fontWeight: 500, fontSize: 12.5 }}>{formatDate(course.lastUpdatedAt)}</Box>
                      <Box component="td">
                        <IconButton size="small" onClick={(e) => handleOpenCourseMenu(e, course)} sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
                          <Iconify icon="solar:menu-dots-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
                {filteredCourses.length === 0 && (
                  <Box component="tr"><Box component="td" colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>لا توجد دورات</Box></Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Subscriptions Tab */}
        {!loadingTab && currentTab === 'subscriptions' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 13, fontWeight: 700, textAlign: 'center' } }}>
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>بيانات المشتري</Box>
                  <Box component="th">الدورة</Box>
                  <Box component="th">المبلغ</Box>
                  <Box component="th">الحالة</Box>
                  <Box component="th">الإيصال</Box>
                  <Box component="th">التاريخ</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {filteredOrders.map((order) => {
                  const os = getOrderStatusLabel(order.status);
                  return (
                    <Box component="tr" key={order.id} sx={{ borderBottom: '1px solid #F1F5F9', '&:hover': { bgcolor: '#F8FAFC' }, '& td': { p: 2, fontSize: 13, textAlign: 'center' } }}>
                      <Box component="td" sx={{ textAlign: 'right !important', pr: 3 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: 13 }}>{getInitials(order.buyerName)}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{order.buyerName}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>{order.buyerEmail}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <Box component="td">
                        {order.items.map((item) => (
                          <Typography key={item.id} sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.courseTitle}</Typography>
                        ))}
                      </Box>
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 800 }}>{order.total}</Box>
                      <Box component="td">
                        <Chip label={os.label} size="small" sx={{ bgcolor: os.bg, color: os.color, fontWeight: 700, fontSize: 12, height: 24, borderRadius: 1.5 }} />
                      </Box>
                      <Box component="td">
                        <Button size="small" variant="outlined" onClick={() => { setSelectedOrder(order); setReceiptOpen(true); }} startIcon={<Iconify icon="solar:document-text-linear" width={16} />} sx={{ gap: 0.75, '& .MuiButton-startIcon': { m: 0 }, borderRadius: 1.5, borderColor: '#E2E8F0', color: '#008767', bgcolor: '#F0FDF4', fontWeight: 700, fontSize: 12, px: 1.5, py: 0.5, '&:hover': { bgcolor: '#DCFCE7', borderColor: '#86EFAC' } }}>
                          عرض الإيصال
                        </Button>
                      </Box>
                      <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>{formatDate(order.creationTime)}</Box>
                    </Box>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <Box component="tr"><Box component="td" colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>لا توجد طلبات</Box></Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Reviews Tab */}
        {!loadingTab && currentTab === 'reviews' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 950 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 13, fontWeight: 700, textAlign: 'center' } }}>
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>الطالب</Box>
                  <Box component="th">الدورة</Box>
                  <Box component="th">تقييم الدورة</Box>
                  <Box component="th">تعليق الدورة</Box>
                  <Box component="th">تقييم المحاضر</Box>
                  <Box component="th">تعليق المحاضر</Box>
                  <Box component="th">التاريخ</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {filteredReviews.map((rev) => (
                  <Box component="tr" key={rev.id} sx={{ borderBottom: '1px solid #F1F5F9', '&:hover': { bgcolor: '#F8FAFC' }, '& td': { p: 2, fontSize: 13, textAlign: 'center' } }}>
                    <Box component="td" sx={{ textAlign: 'right !important', pr: 3 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={rev.studentImageUrl ?? undefined} sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: 13 }}>{getInitials(rev.studentName)}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{rev.studentName}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{rev.courseTitle}</Box>
                    <Box component="td">
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Iconify icon="solar:star-bold" width={14} sx={{ color: '#F59E0B' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{rev.courseRate}</Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ maxWidth: 280, textAlign: 'center', py: 2 }}><Typography sx={{ color: '#334155', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>&ldquo;{rev.courseComment}&rdquo;</Typography></Box>
                    <Box component="td">
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Iconify icon="solar:star-bold" width={14} sx={{ color: '#F59E0B' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{rev.instructorRate}</Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ maxWidth: 280, textAlign: 'center', py: 2 }}><Typography sx={{ color: '#334155', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>&ldquo;{rev.instructorComment}&rdquo;</Typography></Box>
                    <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>{formatDate(rev.createdAt)}</Box>
                  </Box>
                ))}
                {filteredReviews.length === 0 && (
                  <Box component="tr"><Box component="td" colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>لا توجد تقييمات</Box></Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Pagination */}
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9' }}>
          <TablePagination
            component="div"
            count={currentTab === 'courses' ? coursesTotal : currentTab === 'subscriptions' ? ordersTotal : reviewsTotal}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[6, 12, 24]}
            labelRowsPerPage="Rows per page:"
          />
        </Box>
      </Card>

      {/* Course Actions Menu */}
      <Menu
        anchorEl={courseAnchorEl}
        open={Boolean(courseAnchorEl)}
        onClose={handleCloseCourseMenu}
        slotProps={{ paper: { sx: { minWidth: 160, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', py: 0.5 } } }}
      >
        <MenuItem onClick={() => { if (selectedCourse) router.push(`/courses/${selectedCourse.id}`); handleCloseCourseMenu(); }} sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}>
          <Iconify icon="solar:eye-bold" width={18} sx={{ color: '#2563EB' }} />
          عرض تفاصيل الدورة
        </MenuItem>
      </Menu>

      {/* Receipt Dialog */}
      <PaymentReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        order={selectedOrder ? { id: selectedOrder.id, total: selectedOrder.total, creationTime: selectedOrder.creationTime } as any : null}
        studentName={selectedOrder?.buyerName}
      />
    </Box>
  );
}

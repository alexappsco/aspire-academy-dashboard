'use client';

import React, { useState, useMemo } from 'react';
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
import Rating from '@mui/material/Rating';
import TablePagination from '@mui/material/TablePagination';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import {
  MOCK_INSTRUCTOR_PROFILE,
  MOCK_INSTRUCTORS_LIST,
  MOCK_PUBLISHED_COURSES,
  MOCK_SUBSCRIPTION_REQUESTS,
  MOCK_INSTRUCTOR_REVIEWS,
} from './_mock';
import {
  InstructorProfile,
  InstructorCourseItem,
  InstructorSubscriptionRequest,
  InstructorReviewItem,
} from 'src/types/instructor';
import PaymentReceiptDialog from 'src/sections/students/PaymentReceiptDialog';

interface Props {
  instructorId?: string;
}

export default function InstructorDetailsView({ instructorId }: Props) {
  const router = useRouter();
  const toast = useToast();

  // Find instructor or fallback to default mock
  const instructor: InstructorProfile =
    MOCK_INSTRUCTORS_LIST.find((inst) => inst.id === instructorId) || MOCK_INSTRUCTOR_PROFILE;

  const [isActiveAccount, setIsActiveAccount] = useState<boolean>(instructor.isActive);
  const [currentTab, setCurrentTab] = useState<'courses' | 'subscriptions' | 'reviews'>('courses');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Subscriptions interactive state
  const [subscriptionsList, setSubscriptionsList] = useState<InstructorSubscriptionRequest[]>(
    MOCK_SUBSCRIPTION_REQUESTS
  );

  // Published Courses interactive state
  const [coursesList, setCoursesList] = useState<InstructorCourseItem[]>(MOCK_PUBLISHED_COURSES);

  // Receipt Modal State
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedSubForReceipt, setSelectedSubForReceipt] = useState<InstructorSubscriptionRequest | null>(null);

  // Action Menu State for Courses Table
  const [courseAnchorEl, setCourseAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourseItem | null>(null);

  const handleOpenCourseMenu = (e: React.MouseEvent<HTMLElement>, course: InstructorCourseItem) => {
    setCourseAnchorEl(e.currentTarget);
    setSelectedCourse(course);
  };

  const handleCloseCourseMenu = () => {
    setCourseAnchorEl(null);
    setSelectedCourse(null);
  };

  // Toggle Account Status
  const handleToggleAccount = () => {
    setIsActiveAccount((prev) => {
      const next = !prev;
      if (next) {
        toast.success('تم تفعيل حساب المحاضر بنجاح');
      } else {
        toast.warning('تم إيقاف حساب المحاضر مؤقتاً');
      }
      return next;
    });
  };

  // Subscriptions Actions
  const handleApproveSubscription = (id: string) => {
    setSubscriptionsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved', statusText: 'مقبول' } : item))
    );
    toast.success('تم قبول طلب الاشتراك وتفعيل الدورة للطالب');
  };

  const handleRejectSubscription = (id: string) => {
    setSubscriptionsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected', statusText: 'مرفوض' } : item))
    );
    toast.error('تم رفض طلب الاشتراك');
  };

  const handleOpenReceiptDialog = (sub: InstructorSubscriptionRequest) => {
    setSelectedSubForReceipt(sub);
    setReceiptOpen(true);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return coursesList.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSpec = c.specialty.toLowerCase().includes(q);
        if (!matchTitle && !matchSpec) return false;
      }
      return true;
    });
  }, [coursesList, statusFilter, searchQuery]);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsList.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.studentName.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        if (!matchName && !matchCourse) return false;
      }
      return true;
    });
  }, [subscriptionsList, statusFilter, searchQuery]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return MOCK_INSTRUCTOR_REVIEWS.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.studentName.toLowerCase().includes(q);
        const matchCourse = r.courseTitle.toLowerCase().includes(q);
        if (!matchName && !matchCourse) return false;
      }
      return true;
    });
  }, [searchQuery]);

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Top Instructor Profile Header Card */}
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
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          {/* Right Side in RTL: Avatar + Name + Subtitle + Rating + Active Chip */}
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start', gap: 2.5 }}>
            {/* Avatar with Border & Active Badge */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={instructor.imageUrl}
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

              {/* Status Pill Badge directly below avatar */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: '50%',
                  transform: 'translateX(50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#FFFFFF',
                        }}
                      />
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

            {/* Name, Specialty and Star Rating */}
            <Box sx={{ pt: 0.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: { xs: 18, md: 22 },
                  mb: 0.5,
                }}
              >
                {instructor.name}
              </Typography>

              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: 13.5,
                  fontWeight: 600,
                  mb: 0.75,
                }}
              >
                {instructor.title}
              </Typography>

              {/* Rating Stack */}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13.5 }}>
                  {instructor.rating}
                </Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: 12.5, fontWeight: 500 }}>
                  ({instructor.ratingCount} تقييم من الطلاب)
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Left Side in RTL: Action Buttons (Edit Data & Suspend Account) */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Edit Button */}
            <Button
              variant="contained"
              onClick={() => router.push(`/minutes-management/${instructor.id}`)}
              startIcon={<Iconify icon="solar:pen-bold" width={16} />}
              sx={{
                gap: 1,
                '& .MuiButton-startIcon': { m: 0 },
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13.5,
                px: 2.5,
                py: 0.9,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              تعديل البيانات
            </Button>

            {/* Suspend / Toggle Button */}
            <Button
              variant="outlined"
              onClick={handleToggleAccount}
              startIcon={<Iconify icon="solar:forbidden-circle-bold" width={16} />}
              sx={{
                gap: 1,
                '& .MuiButton-startIcon': { m: 0 },
                borderColor: '#FFE4E6',
                bgcolor: '#FFF1F2',
                color: '#E11D48',
                fontWeight: 700,
                fontSize: 13.5,
                px: 2.5,
                py: 0.9,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#FECDD3',
                  bgcolor: '#FFE4E6',
                },
              }}
            >
              {isActiveAccount ? 'إيقاف الحساب' : 'تفعيل الحساب'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 2. 5 Horizontal Info Pill Cards */}
      <Grid container spacing={1.75} sx={{ mb: 2.5 }}>
        {/* Card 1: Joining Date */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>
                تاريخ الانضمام للأكاديمية
              </Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700 }}>
                {instructor.joinedDate}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:calendar-date-bold" width={18} />
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Email */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ textAlign: 'right', overflow: 'hidden' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>
                البريد الإلكتروني
              </Typography>
              <Typography
                sx={{
                  color: '#0F172A',
                  fontSize: 12.5,
                  fontWeight: 700,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {instructor.email}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#EFF6FF',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:letter-bold" width={18} />
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Phone */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>
                رقم الهاتف
              </Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                {instructor.phoneNumber}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:phone-bold" width={18} />
            </Box>
          </Card>
        </Grid>

        {/* Card 4: Country & University */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>
                الدولة والجامعة
              </Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700 }}>
                {instructor.country} — {instructor.university}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:buildings-2-bold" width={18} />
            </Box>
          </Card>
        </Grid>

        {/* Card 5: Qualification */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, mb: 0.25 }}>
                المؤهل العلمي وتاريخ البداية
              </Typography>
              <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 700 }}>
                {instructor.qualification}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#FFFBEB',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:diploma-bold" width={18} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Bio / Summary Card */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
            النبذة المهنية والسريرية:
          </Typography>
        </Stack>
        <Typography sx={{ color: '#475569', fontSize: 13, lineHeight: 1.75, fontWeight: 500 }}>
          {instructor.bio}
        </Typography>
      </Card>

      {/* 4. 5 KPI Metric Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Metric 1: Total Courses */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                إجمالي الدورات
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:book-bookmark-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, mb: 0.5 }}>
                {instructor.totalCourses}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: 11.5, fontWeight: 600 }}>
                {instructor.activeCourses} دورات نشطة معتمدة
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Metric 2: Total Students */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                إجمالي الطلاب
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:users-group-rounded-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#2563EB', fontSize: 26, mb: 0.5 }}>
                {instructor.totalStudents.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB', fontSize: 11.5, fontWeight: 600 }}>
                {instructor.studentsGrowth}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Metric 3: Training Hours */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                ساعات التدريب
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:clock-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', gap: 0.75 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26 }}>
                  {instructor.trainingHours}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>
                  ساعة
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#7C3AED', fontSize: 11.5, fontWeight: 600, mt: 0.5, display: 'block' }}>
                ساعات معتمدة
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Metric 4: Total Sales */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                إجمالي المبيعات
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:wallet-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26, mb: 0.5 }}>
                {instructor.totalSales.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontSize: 11.5, fontWeight: 600 }}>
                {instructor.currency} أرباح تراكمية
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Metric 5: Rating */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                تقييم المحاضر
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:smile-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Iconify icon="solar:star-bold" width={22} sx={{ color: '#F59E0B' }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: 26 }}>
                  {instructor.rating}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#D97706', fontSize: 11.5, fontWeight: 600 }}>
                نسبة رضا {instructor.satisfactionRate}%
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Navigation Tabs */}
      <Box sx={{ mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => {
            setCurrentTab(val);
            setPage(0);
          }}
          sx={{
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTabs-indicator': {
              bgcolor: '#2563EB',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {/* Tab 1: Published Courses */}
          <Tab
            value="courses"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:folder-with-files-bold" width={18} />
                <span>الدورات المنشورة ({coursesList.length})</span>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />

          {/* Tab 2: Subscription Requests */}
          <Tab
            value="subscriptions"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:clipboard-list-bold" width={18} />
                <span>طلبات الاشتراك</span>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />

          {/* Tab 3: Reviews */}
          <Tab
            value="reviews"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:star-bold" width={18} />
                <span>التقييمات</span>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* 6. Main Content Card (Filters + Table) */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Filter Bar (Search on Right, 3 Selects on Left in RTL) */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          {/* Search Input (Right in RTL) */}
          <TextField
            fullWidth
            size="small"
            placeholder={
              currentTab === 'courses'
                ? 'البحث في الدورات...'
                : currentTab === 'subscriptions'
                ? 'البحث في طلبات الاشتراك...'
                : 'البحث في التقييمات...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: '#94A3B8' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />

          {/* 3 Dropdowns (Left in RTL) */}
          <Stack direction="row" spacing={1.5} sx={{ gap: 1.5, flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
            {/* Classification Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '30%', md: 130 } }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">التصنيف</MenuItem>
                <MenuItem value="cardio">أمراض القلب</MenuItem>
                <MenuItem value="surgery">الجراحة العامة</MenuItem>
                <MenuItem value="pharm">الفارماكولوجي</MenuItem>
              </Select>
            </FormControl>

            {/* Price Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '30%', md: 120 } }}>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">السعر</MenuItem>
                <MenuItem value="low">الأقل سعراً</MenuItem>
                <MenuItem value="high">الأعلى سعراً</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '30%', md: 120 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">الحالة</MenuItem>
                <MenuItem value="active">نشط / مقبول</MenuItem>
                <MenuItem value="paused">متوقف</MenuItem>
                <MenuItem value="pending">قيد المراجعة</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* 7. Tab 1 Content: Published Courses Table */}
        {currentTab === 'courses' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
              <Box component="thead">
                <Box
                  component="tr"
                  sx={{
                    bgcolor: '#F8FAFC',
                    '& th': {
                      p: 1.75,
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: 'center',
                    },
                  }}
                >
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>اسم الدورة</Box>
                  <Box component="th">التخصص</Box>
                  <Box component="th">الطلاب</Box>
                  <Box component="th">التقييم</Box>
                  <Box component="th">السعر</Box>
                  <Box component="th">الحالة</Box>
                  <Box component="th">اخر تحديث</Box>
                  <Box component="th" sx={{ width: 60 }}>⋮</Box>
                </Box>
              </Box>

              <Box component="tbody">
                {filteredCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((course) => {
                  const isActive = course.status === 'active';

                  return (
                    <Box
                      component="tr"
                      key={course.id}
                      sx={{
                        borderBottom: '1px solid #F1F5F9',
                        '&:hover': { bgcolor: '#F8FAFC' },
                        '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                      }}
                    >
                      {/* Course Title */}
                      <Box component="td" sx={{ textAlign: 'right !important', pr: 3, fontWeight: 800, color: '#0F172A' }}>
                        {course.title}
                      </Box>

                      {/* Specialty */}
                      <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>
                        {course.specialty}
                      </Box>

                      {/* Students Count */}
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                        {course.studentsCount.toLocaleString()}
                      </Box>

                      {/* Rating */}
                      <Box component="td">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                            {course.rating}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Price */}
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 800 }}>
                        {course.price}
                      </Box>

                      {/* Status */}
                      <Box component="td">
                        <Chip
                          label={course.statusText}
                          size="small"
                          sx={{
                            bgcolor: isActive ? '#ECFDF5' : '#FFF1F2',
                            color: isActive ? '#059669' : '#E11D48',
                            fontWeight: 700,
                            fontSize: 12,
                            height: 24,
                            borderRadius: 1.5,
                            px: 1,
                          }}
                        />
                      </Box>

                      {/* Last Update */}
                      <Box component="td" sx={{ color: '#64748B', fontWeight: 500, fontSize: 12.5 }}>
                        {course.lastUpdated}
                      </Box>

                      {/* Actions Menu */}
                      <Box component="td">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenCourseMenu(e, course)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}
                        >
                          <Iconify icon="solar:menu-dots-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        {/* 8. Tab 2 Content: Subscription Requests Table */}
        {currentTab === 'subscriptions' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box
                  component="tr"
                  sx={{
                    bgcolor: '#F8FAFC',
                    '& th': {
                      p: 1.75,
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: 'center',
                    },
                  }}
                >
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>بيانات الطالب</Box>
                  <Box component="th">رقم الطالب</Box>
                  <Box component="th">الدورة المطلوبة</Box>
                  <Box component="th">تاريخ الطلب</Box>
                  <Box component="th">الإيصال</Box>
                  <Box component="th">الحالة</Box>
                  <Box component="th">الإجراءات</Box>
                </Box>
              </Box>

              <Box component="tbody">
                {filteredSubscriptions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sub) => {
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';

                    return (
                      <Box
                        component="tr"
                        key={sub.id}
                        sx={{
                          borderBottom: '1px solid #F1F5F9',
                          '&:hover': { bgcolor: '#F8FAFC' },
                          '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                        }}
                      >
                        {/* Student Info */}
                        <Box component="td" sx={{ textAlign: 'right !important', pr: 3 }}>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            >
                              {sub.studentInitials}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                                {sub.studentName}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                                {sub.studentEmail}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Phone */}
                        <Box component="td" sx={{ color: '#334155', fontWeight: 600, direction: 'ltr' }}>
                          {sub.studentPhone}
                        </Box>

                        {/* Course & Category */}
                        <Box component="td">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {sub.courseTitle}
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, color: '#007A78', fontWeight: 600 }}>
                            {sub.courseCategory}
                          </Typography>
                        </Box>

                        {/* Request Date */}
                        <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {sub.requestDate}
                        </Box>

                        {/* Receipt Button */}
                        <Box component="td">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenReceiptDialog(sub)}
                            startIcon={<Iconify icon="solar:document-text-linear" width={16} />}
                            sx={{
                              gap: 0.75,
                              '& .MuiButton-startIcon': { m: 0 },
                              borderRadius: 1.5,
                              borderColor: '#E2E8F0',
                              color: '#008767',
                              bgcolor: '#F0FDF4',
                              fontWeight: 700,
                              fontSize: 12,
                              px: 1.5,
                              py: 0.5,
                              '&:hover': {
                                bgcolor: '#DCFCE7',
                                borderColor: '#86EFAC',
                              },
                            }}
                          >
                            عرض الإيصال
                          </Button>
                        </Box>

                        {/* Status */}
                        <Box component="td">
                          <Chip
                            label={sub.statusText}
                            size="small"
                            sx={{
                              bgcolor: isApproved ? '#ECFDF5' : isRejected ? '#FFF1F2' : '#FEF3C7',
                              color: isApproved ? '#059669' : isRejected ? '#E11D48' : '#B45309',
                              fontWeight: 700,
                              fontSize: 12,
                              height: 24,
                              borderRadius: 1.5,
                            }}
                          />
                        </Box>

                        {/* Actions (Accept / Reject quick buttons) */}
                        <Box component="td">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleApproveSubscription(sub.id)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1.5,
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                '&:hover': { bgcolor: '#DCFCE7' },
                              }}
                            >
                              <Iconify icon="solar:check-read-linear" width={16} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => handleRejectSubscription(sub.id)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1.5,
                                bgcolor: '#FFF1F2',
                                color: '#E11D48',
                                border: '1px solid #FECDD3',
                                '&:hover': { bgcolor: '#FFE4E6' },
                              }}
                            >
                              <Iconify icon="mingcute:close-line" width={16} />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Box>
        )}

        {/* 9. Tab 3 Content: Reviews Table */}
        {currentTab === 'reviews' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 950 }}>
              <Box component="thead">
                <Box
                  component="tr"
                  sx={{
                    bgcolor: '#F8FAFC',
                    '& th': {
                      p: 1.75,
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: 'center',
                    },
                  }}
                >
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>الطالب</Box>
                  <Box component="th">الدورة التدريبية</Box>
                  <Box component="th">تقييم الدورة والتعليق</Box>
                  <Box component="th">تقييم المحاضر والتعليق</Box>
                  <Box component="th">تاريخ التقييم</Box>
                </Box>
              </Box>

              <Box component="tbody">
                {filteredReviews
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rev) => {
                    return (
                      <Box
                        component="tr"
                        key={rev.id}
                        sx={{
                          borderBottom: '1px solid #F1F5F9',
                          '&:hover': { bgcolor: '#F8FAFC' },
                          '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                        }}
                      >
                        {/* Student */}
                        <Box component="td" sx={{ textAlign: 'right !important', pr: 3 }}>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            >
                              {rev.studentInitials}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                                {rev.studentName}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                                {rev.studentEmail}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Course */}
                        <Box component="td">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {rev.courseTitle}
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, color: '#007A78', fontWeight: 600 }}>
                            {rev.courseCategory}
                          </Typography>
                        </Box>

                        {/* Course Rating & Comment */}
                        <Box component="td" sx={{ maxWidth: 260, textAlign: 'center' }}>
                          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                                {rev.courseRating.toFixed(1)}
                              </Typography>
                              <Rating value={rev.courseRating} precision={0.5} readOnly size="small" />
                            </Stack>
                            <Typography
                              sx={{
                                color: '#64748B',
                                fontSize: 12,
                                fontStyle: 'italic',
                                lineHeight: 1.4,
                              }}
                            >
                              "{rev.courseComment}"
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Instructor Rating & Comment */}
                        <Box component="td" sx={{ maxWidth: 260, textAlign: 'center' }}>
                          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                                {rev.instructorRating.toFixed(1)}
                              </Typography>
                              <Rating value={rev.instructorRating} precision={0.5} readOnly size="small" />
                            </Stack>
                            <Typography
                              sx={{
                                color: '#64748B',
                                fontSize: 12,
                                fontStyle: 'italic',
                                lineHeight: 1.4,
                              }}
                            >
                              "{rev.instructorComment}"
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Date */}
                        <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {rev.reviewDate}
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Box>
        )}

        {/* Table Pagination */}
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9' }}>
          <TablePagination
            component="div"
            count={
              currentTab === 'courses'
                ? filteredCourses.length
                : currentTab === 'subscriptions'
                ? filteredSubscriptions.length
                : filteredReviews.length
            }
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 12, 24]}
            labelRowsPerPage="Rows per page:"
          />
        </Box>
      </Card>

      {/* Course Actions Popover Menu */}
      <Menu
        anchorEl={courseAnchorEl}
        open={Boolean(courseAnchorEl)}
        onClose={handleCloseCourseMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedCourse) {
              router.push(`/courses/${selectedCourse.id}`);
            }
            handleCloseCourseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:eye-bold" width={18} sx={{ color: '#2563EB' }} />
          عرض تفاصيل الدورة
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCourse) {
              setCoursesList((prev) =>
                prev.map((c) =>
                  c.id === selectedCourse.id
                    ? {
                        ...c,
                        status: c.status === 'active' ? 'paused' : 'active',
                        statusText: c.status === 'active' ? 'متوقف' : 'نشط',
                      }
                    : c
                )
              );
              toast.success('تم تحديث حالة الدورة بنجاح');
            }
            handleCloseCourseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:refresh-circle-bold" width={18} sx={{ color: '#10B981' }} />
          {selectedCourse?.status === 'active' ? 'إيقاف الدورة مؤقتاً' : 'تفعيل الدورة'}
        </MenuItem>
      </Menu>

      {/* Payment Receipt Verification Dialog */}
      <PaymentReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        order={
          selectedSubForReceipt
            ? {
                id: selectedSubForReceipt.id,
                orderNumber: selectedSubForReceipt.orderNumber,
                itemTitle: selectedSubForReceipt.courseTitle,
                amount: selectedSubForReceipt.amount,
                orderDate: selectedSubForReceipt.requestDate,
                status: selectedSubForReceipt.status === 'approved' ? 'paid_active' : 'under_review',
                statusText: selectedSubForReceipt.statusText,
              }
            : null
        }
        studentName={selectedSubForReceipt?.studentName || 'د. سارة العتيبي'}
        onAccept={() => {
          if (selectedSubForReceipt) {
            handleApproveSubscription(selectedSubForReceipt.id);
          }
        }}
        onReject={() => {
          if (selectedSubForReceipt) {
            handleRejectSubscription(selectedSubForReceipt.id);
          }
        }}
      />
    </Box>
  );
}

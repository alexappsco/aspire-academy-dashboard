'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';
import {
  getStudentById,
  getStudentCourses,
  getStudentOrders,
  activateStudent,
  deactivateStudent,
} from 'src/actions/students';
import { StudentItem, StudentCourseItem, StudentOrderItem } from 'src/types/student';
import { MOCK_STUDENTS } from './_mock';
import PaymentReceiptDialog from './PaymentReceiptDialog';

interface Props {
  studentId: string;
}

function formatDate(dateStr?: string | null, locale: string = 'ar'): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getOrderStatusInfo(status: unknown, t: (key: string) => string) {
  const str = String(status ?? '').trim().toLowerCase();
  const isPending = str === 'pending' || str === '0' || str === 'under_review';
  const isPaid = str === 'paid' || str === '1' || str === 'paid_active';
  const isCancelled = str === 'cancelled' || str === 'canceled' || str === '2';

  if (isPending) {
    return {
      label: t('details.orders_table.status_pending'),
      color: '#B45309',
      bgcolor: '#FEF3C7',
      isPending: true,
      isPaid: false,
      isCancelled: false,
    };
  }
  if (isPaid) {
    return {
      label: t('details.orders_table.status_paid'),
      color: '#059669',
      bgcolor: '#ECFDF5',
      isPending: false,
      isPaid: true,
      isCancelled: false,
    };
  }
  if (isCancelled) {
    return {
      label: t('details.orders_table.status_cancelled'),
      color: '#DC2626',
      bgcolor: '#FEE2E2',
      isPending: false,
      isPaid: false,
      isCancelled: true,
    };
  }

  return {
    label: String(status || '-'),
    color: '#64748B',
    bgcolor: '#F1F5F9',
    isPending: false,
    isPaid: false,
    isCancelled: false,
  };
}


export default function StudentDetailsView({ studentId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('Students');
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [courses, setCourses] = useState<StudentCourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [orders, setOrders] = useState<StudentOrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'overview' | 'academic' | 'courses' | 'orders'>('overview');
  const [copied, setCopied] = useState(false);
  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StudentOrderItem | null>(null);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentById(studentId);
      if (res.success && res.data) {
        setStudent(res.data);
      } else {
        // Fallback to mock student if ID not found in backend
        const fallback = MOCK_STUDENTS.find((s) => s.id === studentId) || MOCK_STUDENTS[0];
        setStudent(fallback as unknown as StudentItem);
      }
    } catch {
      const fallback = MOCK_STUDENTS.find((s) => s.id === studentId) || MOCK_STUDENTS[0];
      setStudent(fallback as unknown as StudentItem);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await getStudentCourses(studentId);
      if (res.success && res.data) {
        setCourses(res.data.items);
      }
    } catch {
      // Ignored
    } finally {
      setCoursesLoading(false);
    }
  }, [studentId]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await getStudentOrders(studentId);
      if (res.success && res.data) {
        setOrders(res.data.items);
      }
    } catch {
      // Ignored
    } finally {
      setOrdersLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentData();
    fetchCourses();
    fetchOrders();
  }, [fetchStudentData, fetchCourses, fetchOrders]);


  const handleCopyId = () => {
    if (student?.id) {
      navigator.clipboard.writeText(student.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStatus = async () => {
    if (!student) return;
    const nextStatus = !student.isActive;
    try {
      const res = nextStatus ? await activateStudent(student.id) : await deactivateStudent(student.id);
      if (res.success) {
        setStudent((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));
        toast.success(nextStatus ? t('messages.activate_success') : t('messages.deactivate_success'));
      } else {
        setStudent((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));
        toast.success(nextStatus ? t('messages.activate_success') : t('messages.deactivate_success'));
      }
    } catch {
      toast.error(t('messages.status_error'));
    }
  };

  const handleOpenReceipt = (order: StudentOrderItem) => {
    setSelectedOrder(order);
    setOpenReceiptModal(true);
  };

  const handleAcceptReceipt = () => {
    if (selectedOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: 'Paid', receiptVerified: true }
            : o
        )
      );
    }
    toast.success(t('details.receipt_accept_toast'));
  };

  const handleRejectReceipt = () => {
    if (selectedOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: 'Cancelled', receiptVerified: false }
            : o
        )
      );
    }
    toast.error(t('details.receipt_reject_toast'));
  };


  if (loading) {
    return (
      <Box sx={{ py: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={38} sx={{ color: '#008767' }} />
      </Box>
    );
  }

  const currentStudent = student || (MOCK_STUDENTS[0] as unknown as StudentItem);
  const currencySymbol = currentStudent.country?.currency?.symbol || 'د.ك';

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* Title & Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<Iconify icon={locale === 'ar' ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'} width={14} sx={{ color: '#94A3B8' }} />}
          sx={{ mb: 1, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Link href="/students">{t('details.breadcrumb_students')}</Link>
          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
            {currentStudent.name || t('details.details_title')}
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: 22, md: 26 },
          }}
        >
          {t('title')}
        </Typography>
      </Box>

      {/* 1. Student Profile Header Card */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          {/* Avatar + Name + Badges + Meta Info */}
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={currentStudent.imageUrl}
                alt={currentStudent.name}
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {currentStudent.name ? currentStudent.name.slice(0, 2) : (locale === 'ar' ? 'ط' : 'S')}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  left: -2,
                  width: 14,
                  height: 14,
                  bgcolor: currentStudent.isActive ? '#10B981' : '#94A3B8',
                  border: '2px solid #FFFFFF',
                  borderRadius: '50%',
                }}
              />
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 18, md: 22 } }}
                >
                  {currentStudent.name || t('details.unnamed')}
                </Typography>

                {/* ID Copy Chip */}
                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'} width={14} />
                      <span>{copied ? t('details.copied') : t('details.copy_id', { id: `${currentStudent.id.slice(0, 8)}...` })}</span>
                    </Stack>
                  }
                  onClick={handleCopyId}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: 12,
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                />

                {/* Status Chip */}
                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: currentStudent.isActive ? '#10B981' : '#94A3B8' }} />
                      <span>{currentStudent.isActive ? t('active') : t('inactive')}</span>
                    </Stack>
                  }
                  size="small"
                  sx={{
                    bgcolor: currentStudent.isActive ? '#ECFDF5' : '#F1F5F9',
                    color: currentStudent.isActive ? '#059669' : '#64748B',
                    fontWeight: 700,
                    fontSize: 12,
                    height: 24,
                    borderRadius: 1.5,
                  }}
                />
              </Stack>

              {/* Subtitle Details */}
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:calendar-date-bold" width={15} sx={{ color: '#94A3B8' }} />
                  <span>{t('details.academic_card.registration_date')} {formatDate(currentStudent.creationTime, locale)}</span>
                </Stack>

                {currentStudent.country?.name && (
                  <>
                    <span>•</span>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:map-point-bold" width={15} sx={{ color: '#94A3B8' }} />
                      <span>{currentStudent.country.name}</span>
                    </Stack>
                  </>
                )}

                {currentStudent.graduationYear ? (
                  <>
                    <span>•</span>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:diploma-bold" width={15} sx={{ color: '#94A3B8' }} />
                      <span>{t('details.academic_card.grad_year')} {t('details.academic_card.grad_batch', { year: currentStudent.graduationYear })}</span>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Box>
          </Stack>

          {/* Action Button (Toggle Account) */}
          <Button
            variant="outlined"
            onClick={handleToggleStatus}
            startIcon={<Iconify icon={currentStudent.isActive ? 'solar:pause-circle-bold' : 'solar:play-circle-bold'} width={18} />}
            sx={{
              flexShrink: 0,
              borderRadius: 2,
              borderColor: currentStudent.isActive ? '#E2E8F0' : '#A7F3D0',
              bgcolor: currentStudent.isActive ? '#FFFFFF' : '#ECFDF5',
              color: currentStudent.isActive ? '#475569' : '#059669',
              fontWeight: 700,
              fontSize: 13.5,
              px: 2.5,
              py: 1,
              gap: 1,
              '& .MuiButton-startIcon': { m: 0 },
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            {currentStudent.isActive ? t('details.toggle_deactivate') : t('details.toggle_activate')}
          </Button>
        </Stack>
      </Card>

      {/* 2. 5 Metric KPI Cards (Live from API) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Courses */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                {t('details.kpi.total_courses')}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:book-bookmark-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 26, mb: 0.5 }}>
                {currentStudent.enrollmentsCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11.5, fontWeight: 500 }}>
                {t('details.kpi.total_courses_sub')}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Completed Courses */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                {t('details.kpi.completed_courses')}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:check-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', fontSize: 26, mb: 0.5 }}>
                {currentStudent.completedCoursesCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: 11.5, fontWeight: 600 }}>
                {t('details.kpi.completed_courses_sub')}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* In Progress Courses */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                {t('details.kpi.in_progress_courses')}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#F0FDF4', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:clock-circle-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', fontSize: 26, mb: 0.5 }}>
                {currentStudent.inProgressCoursesCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 500 }}>
                {t('details.kpi.in_progress_courses_sub')}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Total Paid */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                {t('details.kpi.total_payments')}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:card-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 24, mb: 0.5 }}>
                {currentStudent.totalPayments != null ? `${currentStudent.totalPayments.toLocaleString()} ${currencySymbol}` : `0 ${currencySymbol}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: 11.5, fontWeight: 600 }}>
                {t('details.kpi.total_payments_sub')}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Pending Orders */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFBEB',
              border: '1px solid #FDE68A',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#B45309', fontSize: 13, fontWeight: 700 }}>
                {t('details.kpi.pending_orders')}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:bell-bold" width={18} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#92400E', fontSize: 26, mb: 0.5 }}>
                {currentStudent.pendingOrdersCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#D97706', fontSize: 11.5, fontWeight: 700 }}>
                {t('details.kpi.pending_orders_sub')}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTabs-flexContainer': {
              gap: { xs: 3, sm: 4.5, md: 6 },
            },
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 0.5,
              py: 1.5,
              color: '#64748B',
              fontSize: 15,
              fontWeight: 700,
              '&.Mui-selected': {
                color: '#2563EB',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#2563EB',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            value="overview"
            label={t('details.tabs.overview')}
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 48 }}
          />
          <Tab
            value="academic"
            label={t('details.tabs.academic')}
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 48 }}
          />
          <Tab
            value="courses"
            label={
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1.25 }}>
                <span>{t('details.tabs.courses')}</span>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 1.5,
                    bgcolor: currentTab === 'courses' ? '#EFF6FF' : '#F1F5F9',
                    color: currentTab === 'courses' ? '#2563EB' : '#64748B',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {courses.length || currentStudent.enrollmentsCount || 0}
                </Box>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 48 }}
          />
          <Tab
            value="orders"
            label={
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1.25 }}>
                <span>{t('details.tabs.orders')}</span>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 1.5,
                    bgcolor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {orders.length > 0
                    ? orders.filter((o) => getOrderStatusInfo(o.status, t).isPending).length
                    : (currentStudent.pendingOrdersCount ?? 0)}{' '}
                  {t('details.tabs.pending_badge')}
                </Box>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 15, minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* 4. Tab Content: Overview & Academic Cards */}
      {(currentTab === 'overview' || currentTab === 'academic') && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Personal Info Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, mb: 3 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:user-bold" width={20} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16.5 }}>
                  {t('details.personal_info.title')}
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {/* Row 1: Name + Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('details.personal_info.fullname')}
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 15, fontWeight: 700 }}>
                    {currentStudent.name || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('details.personal_info.email')}
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14.5, fontWeight: 600, direction: 'ltr', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    {currentStudent.email || '-'}
                  </Typography>
                </Grid>

                {/* Row 2: Phone + Birth Date / Academic Year */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('details.personal_info.phone')}
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14.5, fontWeight: 700, direction: 'ltr', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    {currentStudent.phoneNumber || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('details.personal_info.birth_date')}
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14.5, fontWeight: 600 }}>
                    {(currentStudent as any).birthDate || (currentStudent.graduationYear ? t('details.academic_card.grad_batch', { year: currentStudent.graduationYear }) : '-')}
                  </Typography>
                </Grid>

                {/* Row 3: Account Status */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('details.personal_info.account_status')}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: currentStudent.isActive ? '#10B981' : '#94A3B8',
                      }}
                    />
                    <Typography
                      sx={{
                        color: currentStudent.isActive ? '#10B981' : '#64748B',
                        fontSize: 14.5,
                        fontWeight: 700,
                      }}
                    >
                      {currentStudent.isActive ? t('active') : t('inactive')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Academic Registration Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, mb: 3 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:square-academic-cap-2-bold" width={20} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16.5 }}>
                  {t('details.academic_card.title')}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                    {t('details.academic_card.country')}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    {currentStudent.country?.name || '-'}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                    {t('details.academic_card.grad_year')}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    {currentStudent.graduationYear ? t('details.academic_card.grad_batch', { year: currentStudent.graduationYear }) : '-'}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                    {t('details.academic_card.registration_date')}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    {formatDate(currentStudent.creationTime, locale)}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                    {t('details.academic_card.last_activity')}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    {formatDate(currentStudent.lastActiveAt, locale)}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 5. Section: Enrolled Courses & Progress Table (Connected to API) */}
      {(currentTab === 'overview' || currentTab === 'courses') && (
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            mb: 3,
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17, mb: 0.25 }}>
              {t('details.courses_table.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
              {t('details.courses_table.subtitle')}
            </Typography>
          </Box>

          {coursesLoading && (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} sx={{ color: '#008767' }} />
            </Box>
          )}

          {!coursesLoading && courses.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center', color: '#64748B' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {t('details.courses_table.empty')}
              </Typography>
            </Box>
          )}

          {!coursesLoading && courses.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 12.5, fontWeight: 700, textAlign: 'center' } }}>
                    <Box component="th" sx={{ textAlign: `${locale === 'ar' ? 'right' : 'left'} !important`, pr: 3 }}>
                      {t('details.courses_table.col_course')}
                    </Box>
                    <Box component="th">{t('details.courses_table.col_specialization')}</Box>
                    <Box component="th">{t('details.courses_table.col_instructor')}</Box>
                    <Box component="th">{t('details.courses_table.col_enrolled_date')}</Box>
                    <Box component="th">{t('details.courses_table.col_progress')}</Box>
                    <Box component="th">{t('details.courses_table.col_last_activity')}</Box>
                    <Box component="th">{t('details.courses_table.col_status')}</Box>
                    <Box component="th">{t('details.courses_table.col_action')}</Box>
                  </Box>
                </Box>

                <Box component="tbody">
                  {courses.map((course) => {
                    const isCompleted = course.isCompleted;

                    return (
                      <Box
                        component="tr"
                        key={course.enrollmentId || course.courseId}
                        sx={{
                          borderBottom: '1px solid #F1F5F9',
                          '&:hover': { bgcolor: '#F8FAFC' },
                          '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                        }}
                      >
                        {/* Course Title + Image */}
                        <Box component="td" sx={{ textAlign: `${locale === 'ar' ? 'right' : 'left'} !important`, pr: 3 }}>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={course.courseImageUrl}
                              alt={course.courseTitle}
                              variant="rounded"
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: '#EFF6FF',
                                color: '#2563EB',
                                fontWeight: 800,
                                fontSize: 12,
                              }}
                            >
                              <Iconify icon="solar:book-2-linear" width={22} />
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                                {course.courseTitle}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: '#94A3B8', mt: 0.25 }}>
                                {course.specializationName || (locale === 'ar' ? 'عام' : 'General')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Specialization */}
                        <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>
                          {course.specializationName || '-'}
                        </Box>

                        {/* Instructor */}
                        <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                          {course.instructorName || '-'}
                        </Box>

                        {/* Date */}
                        <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {formatDate(course.enrolledAt, locale)}
                        </Box>

                        {/* Progress */}
                        <Box component="td" sx={{ minWidth: 150 }}>
                          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', width: '100%', fontSize: 12 }}>
                              <span style={{ color: isCompleted ? '#059669' : '#2563EB', fontWeight: 700 }}>
                                {isCompleted ? t('details.courses_table.status_completed') : t('details.courses_table.status_in_progress')}
                              </span>
                              <span style={{ color: '#0F172A', fontWeight: 800 }}>{course.progressPercent}%</span>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={course.progressPercent}
                              sx={{
                                width: '100%',
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#F1F5F9',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: isCompleted ? '#10B981' : '#2563EB',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Stack>
                        </Box>

                        {/* Last Activity */}
                        <Box component="td" sx={{ color: '#64748B', fontSize: 12 }}>
                          {formatDate(course.lastActivityAt, locale)}
                        </Box>

                        {/* Status */}
                        <Box component="td">
                          <Chip
                            label={isCompleted ? t('details.courses_table.status_completed') : t('details.courses_table.status_in_progress')}
                            size="small"
                            sx={{
                              bgcolor: isCompleted ? '#ECFDF5' : '#EFF6FF',
                              color: isCompleted ? '#059669' : '#2563EB',
                              fontWeight: 700,
                              fontSize: 11.5,
                              height: 24,
                              borderRadius: 1.5,
                            }}
                          />
                        </Box>

                        {/* Action */}
                        <Box component="td">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => router.push(`/students/${currentStudent.id}/courses/${course.courseId}`)}
                            sx={{
                              borderRadius: 1.5,
                              borderColor: '#E2E8F0',
                              color: '#2563EB',
                              fontWeight: 700,
                              fontSize: 12,
                              px: 1.5,
                              py: 0.5,
                              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE' },
                            }}
                          >
                            {t('details.courses_table.btn_view_progress')}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Card>
      )}

      {/* 6. Section: Orders & Payments Table (Live from API) */}
      {(currentTab === 'overview' || currentTab === 'orders') && (
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17, mb: 0.25 }}>
              {t('details.orders_table.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
              {t('details.orders_table.subtitle')}
            </Typography>
          </Box>

          {ordersLoading && (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} sx={{ color: '#008767' }} />
            </Box>
          )}

          {!ordersLoading && orders.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center', color: '#64748B' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {t('details.orders_table.empty')}
              </Typography>
            </Box>
          )}

          {!ordersLoading && orders.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 12.5, fontWeight: 700, textAlign: 'center' } }}>
                    <Box component="th" sx={{ textAlign: `${locale === 'ar' ? 'right' : 'left'} !important`, pr: 3 }}>
                      {t('details.orders_table.col_order_num')}
                    </Box>
                    <Box component="th">{t('details.orders_table.col_items')}</Box>
                    <Box component="th">{t('details.orders_table.col_amount')}</Box>
                    <Box component="th">{t('details.orders_table.col_date')}</Box>
                    <Box component="th">{t('details.orders_table.col_status')}</Box>
                    <Box component="th">{t('details.orders_table.col_actions')}</Box>
                  </Box>
                </Box>

                <Box component="tbody">
                  {orders.map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status, t);
                    const orderTitle =
                      order.items?.map((i) => i.courseTitle || i.packageName).filter(Boolean).join(' ، ') ||
                      t('details.orders_table.default_order_title');

                    return (
                      <Box
                        component="tr"
                        key={order.id}
                        sx={{
                          borderBottom: '1px solid #F1F5F9',
                          '&:hover': { bgcolor: '#F8FAFC' },
                          '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                        }}
                      >
                        {/* Order Number */}
                        <Box component="td" sx={{ textAlign: `${locale === 'ar' ? 'right' : 'left'} !important`, pr: 3, fontWeight: 800, color: statusInfo.isPending ? '#B45309' : '#0F172A' }}>
                          #ORD-{order.id.slice(0, 8).toUpperCase()}
                        </Box>

                        {/* Item Title */}
                        <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                          {orderTitle}
                        </Box>

                        {/* Amount */}
                        <Box component="td" sx={{ color: '#0F172A', fontWeight: 800 }}>
                          {(order.total ?? order.subtotal ?? 0).toLocaleString()} {currencySymbol}
                        </Box>

                        {/* Date */}
                        <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {formatDate(order.creationTime, locale)}
                        </Box>

                        {/* Status */}
                        <Box component="td">
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              bgcolor: statusInfo.bgcolor,
                              color: statusInfo.color,
                              fontWeight: 700,
                              fontSize: 11.5,
                              height: 24,
                              borderRadius: 1.5,
                            }}
                          />
                        </Box>

                        {/* Actions */}
                        <Box component="td">
                          {statusInfo.isPending || order.receiptUrl ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenReceipt(order)}
                              sx={{
                                bgcolor: '#D97706',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: 12,
                                borderRadius: 1.5,
                                px: 2,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#B45309' },
                              }}
                            >
                              {t('details.orders_table.btn_inspect_receipt')}
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenReceipt(order)}
                              sx={{
                                borderRadius: 1.5,
                                borderColor: '#E2E8F0',
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: 12,
                                px: 2,
                                '&:hover': { bgcolor: '#F8FAFC' },
                              }}
                            >
                              {t('details.orders_table.btn_view_receipt')}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Card>
      )}

      {/* Payment Receipt Verification Dialog */}
      <PaymentReceiptDialog
        open={openReceiptModal}
        onClose={() => setOpenReceiptModal(false)}
        order={selectedOrder}
        studentName={currentStudent.name}
        onAccept={handleAcceptReceipt}
        onReject={handleRejectReceipt}
      />
    </Box>
  );
}

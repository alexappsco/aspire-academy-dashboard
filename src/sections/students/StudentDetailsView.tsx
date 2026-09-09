'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { getStudentById, getStudentCourses, activateStudent, deactivateStudent } from 'src/actions/students';
import { StudentItem, StudentCourseItem, StudentOrderPayment } from 'src/types/student';
import { MOCK_STUDENTS, MOCK_ORDER_PAYMENTS } from './_mock';
import PaymentReceiptDialog from './PaymentReceiptDialog';

interface Props {
  studentId: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function StudentDetailsView({ studentId }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [courses, setCourses] = useState<StudentCourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'overview' | 'academic' | 'courses' | 'orders'>('overview');
  const [copied, setCopied] = useState(false);
  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StudentOrderPayment | null>(null);
  const [ordersList, setOrdersList] = useState<StudentOrderPayment[]>(MOCK_ORDER_PAYMENTS);

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

  useEffect(() => {
    fetchStudentData();
    fetchCourses();
  }, [fetchStudentData, fetchCourses]);

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
        toast.success(nextStatus ? 'تم تفعيل حساب الطالب بنجاح' : 'تم إيقاف حساب الطالب مؤقتاً');
      } else {
        setStudent((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));
        toast.success(nextStatus ? 'تم تفعيل حساب الطالب' : 'تم إيقاف حساب الطالب');
      }
    } catch {
      toast.error('حدث خطأ أثناء تعديل حالة الحساب');
    }
  };

  const handleOpenReceipt = (order: StudentOrderPayment) => {
    setSelectedOrder(order);
    setOpenReceiptModal(true);
  };

  const handleAcceptReceipt = () => {
    if (selectedOrder) {
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: 'paid_active' as const, statusText: 'تم الدفع والتفعيل' }
            : o
        )
      );
    }
    toast.success('تم قبول إيصال الدفع وتفعيل الاشتراك بنجاح');
  };

  const handleRejectReceipt = () => {
    if (selectedOrder) {
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: 'under_review' as const, statusText: 'تم رفض الإيصال' }
            : o
        )
      );
    }
    toast.error('تم رفض إيصال التحويل المصرفي');
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
          separator={<Iconify icon="solar:alt-arrow-left-linear" width={14} sx={{ color: '#94A3B8' }} />}
          sx={{ mb: 1, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Link href="/students">إدارة الطلاب</Link>
          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
            {currentStudent.name || 'تفاصيل الطالب'}
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
          إدارة الطلاب
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
          {/* Right in RTL: Avatar + Name + Badges + Meta Info */}
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
                {currentStudent.name ? currentStudent.name.slice(0, 2) : 'ط'}
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
                  {currentStudent.name}
                </Typography>

                {/* ID Copy Chip */}
                <Chip
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'} width={14} />
                      <span>{copied ? 'تم النسخ' : `ID: ${currentStudent.id.slice(0, 8)}...`}</span>
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
                      <span>{currentStudent.isActive ? 'نشط' : 'معطل'}</span>
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
                  <span>تاريخ التسجيل: {formatDate(currentStudent.creationTime)}</span>
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
                      <span>سنة التخرج: {currentStudent.graduationYear}</span>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Box>
          </Stack>

          {/* Left in RTL: Action Button (Toggle Account) */}
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
            {currentStudent.isActive ? 'إيقاف الحساب مؤقتاً' : 'تفعيل الحساب'}
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
                إجمالي الدورات
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
                مسجل بها بالكامل
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
                الدورات المكتملة
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
                أنهى كافة متطلباتها
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
                قيد الدراسة
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
                دورات مستمرة حالياً
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
                إجمالي المدفوعات
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
                مدفوعة بالكامل
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
                الطلبات المعلقة
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
                • طلبات قيد المراجعة
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
              gap: { xs: 2, sm: 4 },
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
            label="نظرة عامة"
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />
          <Tab
            value="academic"
            label="البيانات الأكاديمية"
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />
          <Tab
            value="courses"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: currentTab === 'courses' ? '#EFF6FF' : '#F1F5F9',
                    color: currentTab === 'courses' ? '#2563EB' : '#64748B',
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {courses.length || currentStudent.enrollmentsCount || 0}
                </Box>
                <span>الدورات المسجلة</span>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />
          <Tab
            value="orders"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {currentStudent.pendingOrdersCount ?? 0} معلق
                </Box>
                <span>الطلبات والمدفوعات</span>
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: 14.5, minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* 4. Tab Content: Overview & Academic Cards */}
      {(currentTab === 'overview' || currentTab === 'academic') && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Right Card: Personal Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:user-bold" width={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                  البيانات الشخصية والاتصال
                </Typography>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    الاسم بالكامل
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 700 }}>
                    {currentStudent.name || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    معرف المستخدم (User ID)
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 600, direction: 'ltr', textAlign: 'right' }}>
                    {currentStudent.userId || currentStudent.id}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    البريد الإلكتروني
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 700 }}>
                    {currentStudent.email || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    رقم الهاتف
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                    {currentStudent.phoneNumber || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    تاريخ الميلاد
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 500, fontStyle: 'italic' }}>
                    غير متوفر من الخادم (لا توجد بيانات من الباك)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    النوع
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 500, fontStyle: 'italic' }}>
                    غير متوفر من الخادم (لا توجد بيانات من الباك)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    الرقم القومي / إثبات الشخصية
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 500, fontStyle: 'italic' }}>
                    غير متوفر من الخادم (لا توجد بيانات من الباك)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    حالة الحساب
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: currentStudent.isActive ? '#10B981' : '#94A3B8' }} />
                    <Typography sx={{ color: currentStudent.isActive ? '#059669' : '#64748B', fontSize: 14, fontWeight: 700 }}>
                      {currentStudent.isActive ? 'مفعل' : 'معطل'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Left Card: Academic Registration */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:square-academic-cap-2-bold" width={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                  التسجيل والتدرج الأكاديمي
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                    الدولة:
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    {currentStudent.country?.name || 'غير محدد'}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                    سنة التخرج:
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    {currentStudent.graduationYear ? `دفعة ${currentStudent.graduationYear}` : 'غير محدد'}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                    الجامعة والكلية:
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: '#64748B', fontStyle: 'italic' }}>
                    غير راجعة من الباك إند
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                    آخر نشاط على المنصة:
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {formatDate(currentStudent.lastActiveAt) || 'غير متوفر'}
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
              سجل الدورات التدريبية والتقدم
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
              الدورات التي التحق بها الطالب ومستوى التقدم الخاص بكل دورة على حدة.
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
                لا توجد دورات مسجلة لهذا الطالب حالياً.
              </Typography>
            </Box>
          )}

          {!coursesLoading && courses.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 12.5, fontWeight: 700, textAlign: 'center' } }}>
                    <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>الدورة التدريبية</Box>
                    <Box component="th">التخصص</Box>
                    <Box component="th">المحاضر المسؤول</Box>
                    <Box component="th">تاريخ التسجيل</Box>
                    <Box component="th">نسبة التقدم بالدورة</Box>
                    <Box component="th">آخر نشاط</Box>
                    <Box component="th">الحالة</Box>
                    <Box component="th">الإجراء</Box>
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
                        <Box component="td" sx={{ textAlign: 'right !important', pr: 3 }}>
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
                                {course.specializationName || 'عام'}
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
                          {formatDate(course.enrolledAt)}
                        </Box>

                        {/* Progress */}
                        <Box component="td" sx={{ minWidth: 150 }}>
                          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', width: '100%', fontSize: 12 }}>
                              <span style={{ color: isCompleted ? '#059669' : '#2563EB', fontWeight: 700 }}>
                                {isCompleted ? 'مكتملة' : 'قيد الدراسة'}
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
                          {formatDate(course.lastActivityAt)}
                        </Box>

                        {/* Status */}
                        <Box component="td">
                          <Chip
                            label={isCompleted ? 'مكتملة' : 'مستمرة'}
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
                            عرض التقدم
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

      {/* 6. Section: Orders & Payments Table (Informational Note) */}
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
              سجل الطلبات والتحويلات المالية الأخيرة
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
              تفاصيل المدفوعات، إيصالات التحويل البنكي، والطلبات المعلقة.
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: '#F8FAFC', '& th': { p: 1.75, color: '#64748B', fontSize: 12.5, fontWeight: 700, textAlign: 'center' } }}>
                  <Box component="th" sx={{ textAlign: 'right !important', pr: 3 }}>رقم الطلب</Box>
                  <Box component="th">تفاصيل البند / الدورة</Box>
                  <Box component="th">المبلغ</Box>
                  <Box component="th">تاريخ الطلب</Box>
                  <Box component="th">حالة الدفع</Box>
                  <Box component="th">إجراءات</Box>
                </Box>
              </Box>

              <Box component="tbody">
                {ordersList.map((order, idx) => {
                  const isReview = order.status === 'under_review';

                  return (
                    <Box
                      component="tr"
                      key={idx}
                      sx={{
                        borderBottom: '1px solid #F1F5F9',
                        '&:hover': { bgcolor: '#F8FAFC' },
                        '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                      }}
                    >
                      {/* Order Number */}
                      <Box component="td" sx={{ textAlign: 'right !important', pr: 3, fontWeight: 800, color: isReview ? '#B45309' : '#0F172A' }}>
                        {order.orderNumber}
                      </Box>

                      {/* Item Title */}
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                        {order.itemTitle}
                      </Box>

                      {/* Amount */}
                      <Box component="td" sx={{ color: '#0F172A', fontWeight: 800 }}>
                        {order.amount}
                      </Box>

                      {/* Date */}
                      <Box component="td" sx={{ color: '#64748B', fontWeight: 500 }}>
                        {order.orderDate}
                      </Box>

                      {/* Status */}
                      <Box component="td">
                        <Chip
                          label={order.statusText}
                          size="small"
                          sx={{
                            bgcolor: isReview ? '#FEF3C7' : '#ECFDF5',
                            color: isReview ? '#B45309' : '#059669',
                            fontWeight: 700,
                            fontSize: 11.5,
                            height: 24,
                            borderRadius: 1.5,
                          }}
                        />
                      </Box>

                      {/* Actions */}
                      <Box component="td">
                        {isReview ? (
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
                            فحص الإيصال
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
                            عرض الفاتورة
                          </Button>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocale } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import { useAuth } from 'src/contexts/AuthContext';
import { useToast } from 'src/components/toast';
import { getInstructorDashboardAction } from 'src/actions/instructor-dashboard';
import type { InstructorDashboardDto } from 'src/types/instructor-dashboard';
import { MOCK_INSTRUCTOR_DASHBOARD } from './_mock';
import type { InstructorDashboardData, InstructorCourseRow, InstructorAttentionItem } from './types';

import InstructorHeaderBanner from './components/InstructorHeaderBanner';
import InstructorKpiCards from './components/InstructorKpiCards';
import InstructorAttentionCard from './components/InstructorAttentionCard';
import InstructorStudentGrowthChart from './components/InstructorStudentGrowthChart';
import InstructorCourseStatusChart from './components/InstructorCourseStatusChart';
import InstructorCoursesTable from './components/InstructorCoursesTable';
import EarningsOverviewCard from './components/EarningsOverviewCard';

function formatDate(dateStr?: string, locale: string = 'ar'): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function parseCourseStatus(
  statusVal: unknown,
  locale: string = 'ar'
): {
  color: string;
  label: string;
  key: 'active' | 'under_review' | 'rejected';
} {
  const s = String(statusVal ?? '').trim().toLowerCase();

  // Status 2 or text containing pending/review -> Under review
  if (s === '2' || s.includes('pending') || s.includes('review')) {
    return {
      color: '#F59E0B',
      label: locale === 'ar' ? 'قيد مراجعة الإدارة' : 'Under Admin Review',
      key: 'under_review',
    };
  }

  // Status 3 or text containing reject -> Rejected
  if (s === '3' || s.includes('reject')) {
    return {
      color: '#EF4444',
      label: locale === 'ar' ? 'مرفوضة / بحاجة لتعديل' : 'Rejected / Needs Modification',
      key: 'rejected',
    };
  }

  // Status 1 or default -> Published
  return {
    color: '#00A76F',
    label: locale === 'ar' ? 'منشورة' : 'Published',
    key: 'active',
  };
}

function mapDtoToViewModel(rawDto: unknown, locale: string = 'ar'): InstructorDashboardData {
  const dto = ((rawDto as { result?: InstructorDashboardDto; data?: InstructorDashboardDto })?.result ||
    (rawDto as { result?: InstructorDashboardDto; data?: InstructorDashboardDto })?.data ||
    rawDto ||
    {}) as InstructorDashboardDto;

  return {
    instructorName: 'د. أحمد',
    kpis: {
      activeCourses: dto.statCards?.activeCoursesCount ?? 0,
      pendingReviewCourses: dto.statCards?.pendingReviewCoursesCount ?? 0,
      enrolledStudents: dto.statCards?.totalStudentsCount ?? 0,
      monthlyStudentsGrowth: dto.statCards?.newStudentsThisMonth ?? 0,
      monthlyEarnings: dto.statCards?.earningsThisMonth ?? 0,
      instructorSharePercentage: dto.statCards?.earningsSharePercent ?? 70,
    },
    attention: {
      pendingTasksCount: dto.needsAttention?.totalPendingTasksCount ?? 0,
      items: [
        {
          id: 'pending_review',
          count: dto.needsAttention?.pendingReviewCoursesCount ?? 0,
          title: locale === 'ar' ? 'دورات بانتظار المراجعة' : 'Courses Awaiting Review',
          description:
            locale === 'ar'
              ? 'بانتظار موافقة الادمن وتحتاج إلى المراجعة قبل النشر للطلاب.'
              : 'Pending admin approval and requires review before publishing to students.',
          badgeBg: '#FEF3C7',
          badgeColor: '#D97706',
          borderColor: '#FDE68A',
          buttonText: locale === 'ar' ? 'متابعة المراجعة' : 'Follow Up Review',
          buttonVariant: 'amber',
          actionType: 'pending_review',
        },
        {
          id: 'accepted',
          count: dto.needsAttention?.acceptedCoursesCount ?? 0,
          title: locale === 'ar' ? 'دورات مقبولة ومنشورة' : 'Accepted & Published Courses',
          description:
            locale === 'ar'
              ? 'تمت الموافقة عليها بنجاح وهي الآن متاحة لجميع الطلاب للتسجيل.'
              : 'Successfully approved and now available for all students to enroll.',
          badgeBg: '#D1FAE5',
          badgeColor: '#059669',
          borderColor: '#A7F3D0',
          buttonText: locale === 'ar' ? 'عرض الكورسات' : 'View Courses',
          buttonVariant: 'emerald',
          actionType: 'accepted',
        },
        {
          id: 'rejected',
          count: dto.needsAttention?.rejectedCoursesCount ?? 0,
          title: locale === 'ar' ? 'دورات مرفوضة' : 'Rejected Courses',
          description:
            locale === 'ar'
              ? 'دورات تحتاج إلى متابعة لمعرفة سبب الرفض واستكمال النواقص.'
              : 'Courses that need follow-up to know rejection reasons and complete missing items.',
          badgeBg: '#FEE2E2',
          badgeColor: '#DC2626',
          borderColor: '#FECACA',
          buttonText: locale === 'ar' ? 'عرض الدورات' : 'View Courses',
          buttonVariant: 'subtle',
          actionType: 'rejected',
        },
      ],
    },
    courseStatus: {
      totalCount: dto.courseStatusOverview?.totalCoursesCount ?? 0,
      items: (dto.courseStatusOverview?.slices || []).map((slice) => {
        const { color, label } = parseCourseStatus(slice.status, locale);

        return {
          label,
          count: slice.count ?? 0,
          percentage: slice.percent ?? 0,
          color,
        };
      }),
    },
    studentGrowth: {
      newStudentsCount: dto.enrollmentTrend?.totalStudents ?? 0,
      growthPercentage: dto.enrollmentTrend?.growthPercent ?? 0,
      dataPoints: (dto.enrollmentTrend?.points || []).map((pt, idx, arr) => ({
        month: pt.label || `${pt.month}`,
        count: pt.totalStudents ?? 0,
        isCurrent: idx === arr.length - 1,
      })),
    },
    courses: (dto.courses?.items || []).map((item) => {
      const { label: statusText, key: rowStatus } = parseCourseStatus(item.status, locale);

      return {
        id: item.id,
        title: item.title,
        specialization: item.specialization?.name || '—',
        studentsCount: String(item.studentsCount ?? 0),
        rating: item.ratingAverage ?? 0,
        price: item.price ?? 0,
        status: rowStatus,
        statusText,
        lastUpdated: formatDate(item.lastUpdatedAt, locale),
      };
    }),
    coursesTotalCount: dto.courses?.totalCount ?? 0,
    earnings: {
      totalRevenue: dto.profitOverview?.totalRevenue ?? 0,
      instructorShare: dto.profitOverview?.instructorShare ?? 0,
      instructorPercentage: dto.profitOverview?.instructorSharePercent ?? 70,
      platformShare: dto.profitOverview?.platformShare ?? 0,
      platformPercentage: dto.profitOverview?.platformSharePercent ?? 30,
    },
  };
}

export default function InstructorHomeView() {
  const router = useRouter();
  const locale = useLocale();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InstructorDashboardData>(MOCK_INSTRUCTOR_DASHBOARD);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInstructorDashboardAction({
        SkipCount: 0,
        MaxResultCount: 100,
      });

      if (res.success && res.data) {
        const mapped = mapDtoToViewModel(res.data, locale);
        setData(mapped);
      } else if (res.error) {
        console.warn('Could not fetch instructor dashboard, using fallback:', res.error);
        toast.error(res.error);
      }
    } catch (err) {
      console.error('Failed to load instructor dashboard:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [locale, toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const instructorDisplayName = user?.name || data.instructorName;

  const handleManageSlots = () => {
    // Navigate or open modal for availability
  };

  const handleAttentionAction = (actionType: InstructorAttentionItem['actionType']) => {
    if (actionType === 'pending_review' || actionType === 'rejected') {
      router.push('/courses');
    } else {
      router.push('/courses');
    }
  };

  const handleViewAllCourses = () => {
    router.push('/courses');
  };

  const handleViewReports = () => {
    router.push('/reports');
  };

  const handleCourseAction = (course: InstructorCourseRow) => {
    router.push(`/courses/${course.id}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={44} sx={{ color: '#2563EB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Header Banner */}
      <InstructorHeaderBanner
        instructorName={instructorDisplayName}
        onManageSlots={handleManageSlots}
      />

      {/* 2. Top 3 KPI Stat Cards */}
      <InstructorKpiCards stats={data.kpis} />

      {/* 3. Needs Attention Section */}
      <InstructorAttentionCard
        data={data.attention}
        onAction={handleAttentionAction}
      />

      {/* 4. Charts Row: Student Registration Growth (8 cols) & Course Status Donut (4 cols) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <InstructorStudentGrowthChart data={data.studentGrowth} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InstructorCourseStatusChart data={data.courseStatus} />
        </Grid>
      </Grid>

      {/* 5. Instructor Courses Table */}
      <InstructorCoursesTable
        courses={data.courses}
        totalCount={data.coursesTotalCount}
        onViewAll={handleViewAllCourses}
        onCourseAction={handleCourseAction}
      />

      {/* 6. Full Width Earnings Overview */}
      <Box sx={{ mt: 3 }}>
        <EarningsOverviewCard
          earnings={data.earnings}
          onViewReports={handleViewReports}
        />
      </Box>
    </Box>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { useToast } from 'src/components/toast';
import { getInstructorReports } from 'src/actions/instructor-reports';
import type { InstructorReportsDto, InstructorTopCourse, InstructorRecentTransaction, InstructorTopStudent } from 'src/types/instructor-reports';
import type { InstructorAnalyticsData, CourseStatus, TransactionStatus, TransactionType } from './types';
import { INSTRUCTOR_ANALYTICS_MOCK } from './mock';

import InstructorHeader from './instructor-header';
import InstructorKpiCards from './instructor-kpi-cards';
import StudentGrowthChart from './student-growth-chart';
import TopCoursesPerformance from './top-courses-performance';
import FinancialRevenueBreakdown from './financial-revenue-breakdown';
import FinancialTransactionsTable from './financial-transactions-table';
import MostEngagedStudents from './most-engaged-students';
import TeachingEfficiencyCard from './teaching-efficiency-card';

// Mapper function
function mapDtoToAnalyticsData(dto: InstructorReportsDto): InstructorAnalyticsData {
  return {
    kpis: {
      totalStudents: dto.statCards.totalStudentsCount || 0,
      studentsGrowthPercent: dto.statCards.totalStudentsGrowthPercent || 0,
      activeCourses: dto.statCards.activeCoursesCount || 0,
      approvedCourses: dto.statCards.activeCoursesCount || 0, // Fallback
      pendingReviewCourses: dto.statCards.pendingCoursesCount || 0,
      completedLessons: dto.statCards.completedLessonsCount || 0,
      lessonsGrowthPercent: dto.statCards.completedLessonsGrowthPercent || 0,
      netEarnings: dto.statCards.netEarnings || 0,
      earningsGrowthPercent: dto.statCards.netEarningsGrowthPercent || 0,
      instructorSharePercent: 70, // Assuming static for now or fallback
    },
    growth: {
      points: dto.enrollmentTrend.map((t) => ({ month: t.label, count: t.totalStudents })),
      newStudentsThisMonth: dto.enrollmentTrend[dto.enrollmentTrend.length - 1]?.totalStudents || 0,
      currentMonth: dto.enrollmentTrend[dto.enrollmentTrend.length - 1]?.label || '',
      currentGrowthPercent: dto.statCards.totalStudentsGrowthPercent || 0,
      retentionRate: 0, // Not provided
    },
    topCourses: dto.topCourses.map((c: InstructorTopCourse) => ({
      id: c.id,
      title: c.title,
      enrolledStudents: c.enrolledStudentsCount || 0,
      completionPercent: c.completionPercent || 0,
      totalRevenue: c.totalRevenue || 0,
      instructorShare: c.netRevenue || 0,
      instructorSharePercent: c.platformPercentage ? 100 - c.platformPercentage : 70,
      status: (c.status === 1 || c.status === '1' || c.status === 'approved' ? 'approved' : 'pending_review') as CourseStatus,
      progressColor: '#0052CC', // Default color
    })),
    financials: {
      grossRevenue: dto.financials.totalRevenue || 0,
      netInstructorShare: dto.financials.netEarnings || 0,
      netInstructorPercent: 70,
      platformShare: dto.financials.platformShare || 0,
      platformPercent: 30,
      pendingPayouts: dto.financials.unsplitRevenue || 0,
    },
    revenueSources: INSTRUCTOR_ANALYTICS_MOCK.revenueSources, // Fallback to mock for now
    transactions: dto.recentTransactions.map((t: InstructorRecentTransaction, i) => ({
      id: t.id || `trx-${i}`,
      dateTime: t.date || '',
      description: t.courseTitle || '',
      student: t.studentName || '',
      type: 'course' as TransactionType,
      totalAmount: t.amount || 0,
      instructorShare: t.netRevenue || 0,
      platformShare: (t.amount || 0) - (t.netRevenue || 0),
      status: (t.status === 1 || t.status === '1' || t.status === 'paid' ? 'paid' : 'pending') as TransactionStatus,
    })),
    totalTransactions: dto.recentTransactions.length,
    engagedStudents: dto.topStudents.map((s: InstructorTopStudent, i) => ({
      id: s.id || `st-${i}`,
      initials: (s.name || 'U').substring(0, 2).toUpperCase(),
      name: s.name || '',
      grade: '',
      lessonsCount: s.lessonsCount || 0,
      totalSpent: s.totalAmountPaid || 0,
      avatarColor: '#0052CC',
    })),
    teachingEfficiency: {
      avgLessonDurationMinutes: dto.teachingEfficiency.avgLessonDurationInMinutes || 0,
      lessonsPerStudent: dto.teachingEfficiency.avgLessonsPerStudent || 0,
      rebookingRate: 0,
      completionRate: dto.teachingEfficiency.completionRatePercent || 0,
      cancellationRate: dto.teachingEfficiency.dropoffRatePercent || 0,
      cancellationTarget: 0,
      ratingAverage: dto.teachingEfficiency.ratingAverage || 0,
      ratingCount: dto.teachingEfficiency.ratingCount || 0,
      instructorName: '',
      instructorId: '',
    },
  };
}

export default function InstructorAnalyticsView() {
  const toast = useToast();
  const [data, setData] = useState<InstructorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getInstructorReports();
      if (res.success && res.data) {
        setData(mapDtoToAnalyticsData(res.data));
      } else if (res.error) {
        toast.error(res.error);
        setData(INSTRUCTOR_ANALYTICS_MOCK); // Fallback to mock
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load reports');
      setData(INSTRUCTOR_ANALYTICS_MOCK); // Fallback to mock
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <Box sx={{ py: 20 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#00A980' }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        direction: 'rtl',
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        py: 3,
        px: { xs: 2, md: 3 },
      }}
    >
      <InstructorHeader totalCourses={data.kpis.activeCourses} periodLabel="هذا الشهر" />

      <InstructorKpiCards kpis={data.kpis} />

      <Grid container spacing={2.5} sx={{ mb: 2, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <StudentGrowthChart growth={data.growth} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FinancialRevenueBreakdown financials={data.financials} revenueSources={data.revenueSources} />
        </Grid>
      </Grid>

      <TopCoursesPerformance topCourses={data.topCourses} />

      <FinancialTransactionsTable
        transactions={data.transactions}
        totalTransactions={data.totalTransactions}
      />

      <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <MostEngagedStudents students={data.engagedStudents} totalStudents={data.kpis.totalStudents} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <TeachingEfficiencyCard efficiency={data.teachingEfficiency} />
        </Grid>
      </Grid>
    </Box>
  );
}
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { getDashboardData } from 'src/actions/dashboard';
import type { DashboardDataResponse } from 'src/types/dashboard';

import HomeHeader from './components/HomeHeader';
import AttentionBanner from './components/AttentionBanner';
import KpiStatsGrid from './components/KpiStatsGrid';
import NeedsAttentionSection from './components/NeedsAttentionSection';
import AcademicStructureCard from './components/AcademicStructureCard';
import StudentsOverviewChart from './components/StudentsOverviewChart';
import CoursesBreakdownCard from './components/CoursesBreakdownCard';
import SalesRevenueCard from './components/SalesRevenueCard';
import TopCoursesTable from './components/TopCoursesTable';
import LatestUsersList from './components/LatestUsersList';
import RecentActivitiesTimeline from './components/RecentActivitiesTimeline';

export default function HomeView() {
  const [data, setData] = useState<DashboardDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <Box sx={{ py: 20 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#2563EB' }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Greeting & Action Buttons Header */}
      <HomeHeader />

      {/* 2. Urgent Attention / Review Banner */}
      <AttentionBanner pendingTasks={data?.pendingTasks} />

      {/* 3. 6 KPI Summary Cards Grid */}
      <KpiStatsGrid statCards={data?.statCards} />

      {/* 4. Needs Attention 3 Action Cards */}
      <NeedsAttentionSection pendingTasks={data?.pendingTasks} />

      {/* 5. Academic Structure Breadcrumb Banner */}
      <AcademicStructureCard academicStructure={data?.academicStructure} />

      {/* 6. Charts Row (Students Spline Chart & Courses Breakdown) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <StudentsOverviewChart studentsOverview={data?.studentsOverview} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CoursesBreakdownCard
            courseStatusDistribution={data?.courseStatusDistribution}
          />
        </Grid>
      </Grid>

      {/* 7. Financial & Sales Overview */}
      <SalesRevenueCard sales={data?.sales} />

      {/* 8. Top Enrolled Courses SharedTable */}
      <TopCoursesTable topCourses={data?.topCourses} />

      {/* 9. Bottom Split Row (Recent Activities Timeline & Latest Users) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RecentActivitiesTimeline />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <LatestUsersList recentAccounts={data?.recentAccounts} />
        </Grid>
      </Grid>
    </Box>
  );
}

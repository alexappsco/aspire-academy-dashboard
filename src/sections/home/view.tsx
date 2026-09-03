'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

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
  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Greeting & Action Buttons Header */}
      <HomeHeader />

      {/* 2. Urgent Attention / Review Banner */}
      <AttentionBanner />

      {/* 3. 6 KPI Summary Cards Grid */}
      <KpiStatsGrid />

      {/* 4. Needs Attention 3 Action Cards */}
      <NeedsAttentionSection />

      {/* 5. Academic Structure Breadcrumb Banner */}
      <AcademicStructureCard />

      {/* 6. Charts Row (Students Spline Chart & Courses Breakdown) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <StudentsOverviewChart />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CoursesBreakdownCard />
        </Grid>
      </Grid>

      {/* 7. Financial & Sales Overview */}
      <SalesRevenueCard />

      {/* 8. Top Enrolled Courses SharedTable */}
      <TopCoursesTable />

      {/* 9. Bottom Split Row (Recent Activities Timeline & Latest Users) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RecentActivitiesTimeline />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <LatestUsersList />
        </Grid>
      </Grid>
    </Box>
  );
}

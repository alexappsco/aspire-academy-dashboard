'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { INSTRUCTOR_ANALYTICS_MOCK as data } from './mock';

import InstructorHeader from './instructor-header';
import InstructorKpiCards from './instructor-kpi-cards';
import StudentGrowthChart from './student-growth-chart';
import TopCoursesPerformance from './top-courses-performance';
import FinancialRevenueBreakdown from './financial-revenue-breakdown';
import FinancialTransactionsTable from './financial-transactions-table';
import MostEngagedStudents from './most-engaged-students';
import TeachingEfficiencyCard from './teaching-efficiency-card';

export default function InstructorAnalyticsView() {
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
      <InstructorHeader totalCourses={data.kpis.activeCourses} periodLabel="هذا الشهر (1 سبتمبر - 30 سبتمبر 2026)" />

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
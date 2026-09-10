'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ReportsHeader from './components/ReportsHeader';
import MetricCards from './components/MetricCards';
import AlertSection from './components/AlertSection';
import ChartsSection from './components/ChartsSection';
import FinancialSummary from './components/FinancialSummary';
import PerformanceTables from './components/PerformanceTables';
import AcademicOverview from './components/AcademicOverview';

export default function ReportsView() {
  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <ReportsHeader />

      <MetricCards />

      <AlertSection />

      <ChartsSection />

      <FinancialSummary />

      <PerformanceTables />

      <AcademicOverview />
    </Box>
  );
}

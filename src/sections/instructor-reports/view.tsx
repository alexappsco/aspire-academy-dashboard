'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { useToast } from 'src/components/toast';
import { getInstructorReports } from 'src/actions/instructor-reports';
import type { InstructorReportsDto } from 'src/types/instructor-reports';

import InstructorReportsHeader from './components/InstructorReportsHeader';
import InstructorMetricCards from './components/InstructorMetricCards';
import EnrollmentTrendChart from './components/EnrollmentTrendChart';
import FinancialOverview from './components/FinancialOverview';
import TopCoursesTable from './components/TopCoursesTable';
import TransactionsStudentsTables from './components/TransactionsStudentsTables';

export default function InstructorReportsView() {
  const toast = useToast();
  const [data, setData] = useState<InstructorReportsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getInstructorReports();
      if (res.success && res.data) {
        setData(res.data);
      } else if (res.error) {
        console.warn('Failed to fetch instructor reports:', res.error);
        toast.error(res.error);
      }
    } catch (err) {
      console.error('Failed to fetch instructor reports', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      <InstructorReportsHeader />

      <InstructorMetricCards statCards={data?.statCards} />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <EnrollmentTrendChart enrollmentTrend={data?.enrollmentTrend} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FinancialOverview
            financials={data?.financials}
            teachingEfficiency={data?.teachingEfficiency}
          />
        </Grid>
      </Grid>

      <TopCoursesTable topCourses={data?.topCourses} />

      <TransactionsStudentsTables
        recentTransactions={data?.recentTransactions}
        topStudents={data?.topStudents}
      />
    </Box>
  );
}
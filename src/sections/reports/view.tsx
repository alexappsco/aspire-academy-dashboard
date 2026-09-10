"use client";

import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import { getReportsData } from "src/actions/reports";
import type { ReportsDataResponse } from "src/types/reports";

import ReportsHeader from "./components/ReportsHeader";
import MetricCards from "./components/MetricCards";
import AlertSection from "./components/AlertSection";
import ChartsSection from "./components/ChartsSection";
import FinancialSummary from "./components/FinancialSummary";
import PerformanceTables from "./components/PerformanceTables";
import AcademicOverview from "./components/AcademicOverview";

export default function ReportsView() {
  const [data, setData] = useState<ReportsDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getReportsData();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports data", err);
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
        <Stack
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <CircularProgress size={40} thickness={4} sx={{ color: "#00A980" }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <ReportsHeader />

      <MetricCards statCards={data?.dashboard?.statCards} />

      <AlertSection pendingTasks={data?.dashboard?.pendingTasks} />

      <ChartsSection
        studentsOverview={data?.dashboard?.studentsOverview}
        courseStatusDistribution={data?.dashboard?.courseStatusDistribution}
      />

      <FinancialSummary
        receiptFinancials={data?.receiptFinancials}
        weeklyCollections={data?.weeklyCollections}
      />

      <PerformanceTables
        topCourses={data?.dashboard?.topCourses}
        topInstructors={data?.topInstructors}
      />

      <AcademicOverview
        academicStructure={data?.dashboard?.academicStructure}
      />
    </Box>
  );
}

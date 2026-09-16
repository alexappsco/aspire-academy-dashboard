'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useRouter } from 'src/i18n/routing';
import { useAuth } from 'src/contexts/AuthContext';
import { MOCK_INSTRUCTOR_DASHBOARD } from './_mock';
import type { InstructorDashboardData, UpcomingLessonItem, InstructorCourseRow } from './types';

import InstructorHeaderBanner from './components/InstructorHeaderBanner';
import InstructorKpiCards from './components/InstructorKpiCards';
import UpcomingLessonsSection from './components/UpcomingLessonsSection';
import TodayScheduleCard from './components/TodayScheduleCard';
import InstructorCoursesTable from './components/InstructorCoursesTable';
import EarningsOverviewCard from './components/EarningsOverviewCard';
import WeeklyAvailabilityCard from './components/WeeklyAvailabilityCard';

export default function InstructorHomeView() {
  const router = useRouter();
  const { user } = useAuth();
  const [data] = useState<InstructorDashboardData>(MOCK_INSTRUCTOR_DASHBOARD);

  const instructorDisplayName = user?.name || data.instructorName;

  const handleManageSlots = () => {
    // Navigate or open modal for availability
  };

  const handleJoinLesson = (lesson: UpcomingLessonItem) => {
    // Handle joining lesson
    console.log('Join lesson:', lesson.id);
  };

  const handleViewLessonDetails = (lesson: UpcomingLessonItem) => {
    console.log('View lesson details:', lesson.id);
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

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Header Banner */}
      <InstructorHeaderBanner
        instructorName={instructorDisplayName}
        onManageSlots={handleManageSlots}
      />

      {/* 2. Top 4 KPI Stat Cards */}
      <InstructorKpiCards stats={data.kpis} />

      {/* 3. Middle Section: Upcoming Online Lessons (8 cols) & Today's Schedule (4 cols) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <UpcomingLessonsSection
            lessons={data.upcomingLessons}
            onViewAll={() => {}}
            onJoinLesson={handleJoinLesson}
            onViewDetails={handleViewLessonDetails}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TodayScheduleCard
            date={data.todayScheduleDate}
            slots={data.todaySchedule}
            onManageAvailability={handleManageSlots}
            onUpdateWeeklySchedule={handleManageSlots}
          />
        </Grid>
      </Grid>

      {/* 4. Instructor Courses Table */}
      <InstructorCoursesTable
        courses={data.courses}
        totalCount={data.coursesTotalCount}
        onViewAll={handleViewAllCourses}
        onCourseAction={handleCourseAction}
      />

      {/* 5. Bottom Section: Earnings Overview (7 cols) & Weekly Availability (5 cols) */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <EarningsOverviewCard
            earnings={data.earnings}
            onViewReports={handleViewReports}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <WeeklyAvailabilityCard
            days={data.weeklyAvailability}
            onManageSlots={handleManageSlots}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

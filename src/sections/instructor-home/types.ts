export interface InstructorKpiStats {
  activeCourses: number;
  pendingReviewCourses: number;
  enrolledStudents: number;
  monthlyStudentsGrowth: number;
  monthlyEarnings: number;
  instructorSharePercentage: number;
  upcomingLessons?: number;
  todayLessonsCount?: number;
}

export interface InstructorAttentionItem {
  id: string;
  count: number;
  title: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
  buttonText: string;
  buttonVariant: 'amber' | 'emerald' | 'subtle';
  actionType: 'pending_review' | 'accepted' | 'rejected';
}

export interface InstructorAttentionData {
  pendingTasksCount: number;
  items: InstructorAttentionItem[];
}

export interface CourseStatusItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CourseStatusChartData {
  totalCount: number;
  items: CourseStatusItem[];
}

export interface StudentGrowthPoint {
  month: string;
  count: number;
  isCurrent?: boolean;
}

export interface StudentGrowthChartData {
  newStudentsCount: number;
  growthPercentage: number;
  dataPoints: StudentGrowthPoint[];
}

export interface InstructorCourseRow {
  id: string;
  title: string;
  specialization: string;
  studentsCount: string;
  rating: number;
  price: number;
  status: 'active' | 'under_review' | 'rejected';
  statusText: string;
  lastUpdated: string;
}

export interface EarningsBreakdown {
  totalRevenue: number;
  instructorShare: number;
  instructorPercentage: number;
  platformShare: number;
  platformPercentage: number;
  pendingPayout?: number;
}

export interface UpcomingLessonItem {
  id: string;
  studentName: string;
  studentGrade: string;
  avatarInitials: string;
  avatarColor?: string;
  subject: string;
  dateTime: string;
  timeNote?: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  statusText: string;
  canJoin: boolean;
}

export interface DailyTimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  statusText: string;
  title?: string;
  attendee?: string;
  duration?: string;
}

export interface WeeklyAvailabilityDay {
  dayName: string;
  timeRange?: string;
  isUnavailable?: boolean;
}

export interface InstructorDashboardData {
  instructorName: string;
  kpis: InstructorKpiStats;
  attention: InstructorAttentionData;
  courseStatus: CourseStatusChartData;
  studentGrowth: StudentGrowthChartData;
  courses: InstructorCourseRow[];
  coursesTotalCount: number;
  earnings: EarningsBreakdown;
  upcomingLessons?: UpcomingLessonItem[];
  todayScheduleDate?: string;
  todaySchedule?: DailyTimeSlot[];
  weeklyAvailability?: WeeklyAvailabilityDay[];
}

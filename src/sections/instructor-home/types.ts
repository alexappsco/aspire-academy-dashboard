export interface InstructorKpiStats {
  activeCourses: number;
  pendingReviewCourses: number;
  enrolledStudents: number;
  monthlyStudentsGrowth: number;
  upcomingLessons: number;
  todayLessonsCount: number;
  monthlyEarnings: number;
  instructorSharePercentage: number;
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
}

export interface WeeklyAvailabilityDay {
  dayName: string;
  timeRange?: string;
  isUnavailable?: boolean;
}

export interface InstructorDashboardData {
  instructorName: string;
  kpis: InstructorKpiStats;
  upcomingLessons: UpcomingLessonItem[];
  todayScheduleDate: string;
  todaySchedule: DailyTimeSlot[];
  courses: InstructorCourseRow[];
  coursesTotalCount: number;
  earnings: EarningsBreakdown;
  weeklyAvailability: WeeklyAvailabilityDay[];
}

export interface InstructorReportsStatCards {
  netEarnings: number;
  netEarningsGrowthPercent: number | null;
  completedLessonsCount: number;
  completedLessonsGrowthPercent: number | null;
  activeCoursesCount: number;
  pendingCoursesCount: number;
  totalStudentsCount: number;
  totalStudentsGrowthPercent: number | null;
}

export interface EnrollmentTrendItem {
  year: number;
  month: number;
  label: string;
  totalStudents: number;
}

export interface InstructorTopCourse {
  id: string;
  title: string;
  status: string | number;
  enrolledStudentsCount: number;
  completionPercent: number;
  totalRevenue: number;
  netRevenue: number;
  platformPercentage: number;
}

export interface InstructorFinancials {
  totalRevenue: number;
  platformShare: number;
  netEarnings: number;
  unsplitRevenue: number;
}

export interface InstructorRecentTransaction {
  id: string;
  studentName?: string;
  courseTitle?: string;
  amount?: number;
  netRevenue?: number;
  date?: string;
  status?: string | number;
}

export interface InstructorTopStudent {
  id: string;
  name?: string;
  imageUrl?: string | null;
  lessonsCount?: number;
  totalAmountPaid?: number;
  completionPercent?: number;
  rating?: number;
  lastLessonDate?: string;
}

export interface TeachingEfficiency {
  avgLessonsPerStudent: number;
  avgLessonDurationInMinutes: number;
  dropoffRatePercent: number;
  completionRatePercent: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface InstructorReportsDto {
  statCards: InstructorReportsStatCards;
  enrollmentTrend: EnrollmentTrendItem[];
  topCourses: InstructorTopCourse[];
  financials: InstructorFinancials;
  recentTransactions: InstructorRecentTransaction[];
  topStudents: InstructorTopStudent[];
  teachingEfficiency: TeachingEfficiency;
}
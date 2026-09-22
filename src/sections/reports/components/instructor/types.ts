export interface InstructorKpiData {
  totalStudents: number;
  studentsGrowthPercent: number;
  activeCourses: number;
  approvedCourses: number;
  pendingReviewCourses: number;
  completedLessons: number;
  lessonsGrowthPercent: number;
  netEarnings: number;
  earningsGrowthPercent: number;
  instructorSharePercent: number;
}

export interface StudentGrowthPoint {
  month: string;
  count: number;
}

export interface StudentGrowthData {
  points: StudentGrowthPoint[];
  newStudentsThisMonth: number;
  currentMonth: string;
  currentGrowthPercent: number;
  retentionRate: number;
}

export type CourseStatus = 'approved' | 'pending_review';

export interface TopCourse {
  id: string;
  title: string;
  enrolledStudents: number;
  completionPercent: number;
  totalRevenue: number;
  instructorShare: number;
  instructorSharePercent: number;
  status: CourseStatus;
  progressColor: string;
}

export interface FinancialMetric {
  grossRevenue: number;
  netInstructorShare: number;
  netInstructorPercent: number;
  platformShare: number;
  platformPercent: number;
  pendingPayouts: number;
}

export interface RevenueSource {
  label: string;
  amount: number;
  percent: number;
  icon: string;
}

export type TransactionStatus = 'paid' | 'pending' | 'refunded';
export type TransactionType = 'course' | 'lesson';

export interface FinancialTransaction {
  id: string;
  dateTime: string;
  description: string;
  student: string;
  type: TransactionType;
  totalAmount: number;
  instructorShare: number;
  platformShare: number;
  status: TransactionStatus;
}

export interface EngagedStudent {
  id: string;
  initials: string;
  name: string;
  grade: string;
  lessonsCount: number;
  totalSpent: number;
  avatarColor: string;
}

export interface TeachingEfficiencyData {
  avgLessonDurationMinutes: number;
  lessonsPerStudent: number;
  rebookingRate: number;
  completionRate: number;
  cancellationRate: number;
  cancellationTarget: number;
  ratingAverage: number;
  ratingCount: number;
  instructorName: string;
  instructorId: string;
}

export interface InstructorAnalyticsData {
  kpis: InstructorKpiData;
  growth: StudentGrowthData;
  topCourses: TopCourse[];
  financials: FinancialMetric;
  revenueSources: RevenueSource[];
  transactions: FinancialTransaction[];
  totalTransactions: number;
  engagedStudents: EngagedStudent[];
  teachingEfficiency: TeachingEfficiencyData;
}
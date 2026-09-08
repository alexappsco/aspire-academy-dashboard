export interface DashboardStatCards {
  totalStudents: number;
  studentsGrowthPercent: number;
  totalInstructors: number;
  instructorsGrowthPercent: number;
  totalCourses: number;
  coursesGrowthPercent: number;
  publishedCourses: number;
  pendingCourses: number;
  rejectedCourses: number;
}

export interface DashboardPendingTasks {
  coursesPendingReview: number;
  newInstructorsPendingVerification: number;
  rejectedCourses: number;
}

export interface DashboardAcademicStructure {
  countriesCount: number;
  universitiesCount: number;
  facultiesCount: number;
  academicYearsCount: number;
  semestersCount: number;
  studyMaterialsCount: number;
  activeCoursesCount: number;
}

export interface DashboardCourseStatusItem {
  status: string | number;
  count: number;
  percent: number;
}

export interface MonthlyNewStudentsItem {
  year: number;
  month: number;
  label: string;
  count: number;
}

export interface DashboardStudentsOverview {
  totalStudents: number;
  newStudentsThisMonth: number;
  newStudentsGrowthPercent: number;
  monthlyNewStudents: MonthlyNewStudentsItem[];
  monthlyActiveStudents: number;
  completionRate: number;
  avgStudyHours: number;
}

export interface MonthlyRevenueItem {
  year: number;
  month: number;
  label: string;
  revenue: number;
}

export interface DashboardSales {
  revenueThisMonth: number;
  revenueGrowthPercent: number;
  completedTransactionsThisMonth: number;
  pendingOrders: number;
  conversionRate: number;
  monthlyRevenue: MonthlyRevenueItem[];
}

export interface DashboardTopCourse {
  id: string;
  title: string;
  instructorName: string;
  specializationName: string;
  studentsCount: number;
  ratingAverage: number;
  price: number;
  status: string | number;
  lastUpdatedAt: string;
}

export interface DashboardRecentAccount {
  userId: string;
  name: string;
  imageUrl?: string | null;
  role: string | number;
  affiliation?: string | null;
  status?: string | number | null;
  createdAt: string;
}

export interface DashboardDataResponse {
  statCards?: DashboardStatCards;
  pendingTasks?: DashboardPendingTasks;
  academicStructure?: DashboardAcademicStructure;
  courseStatusDistribution?: DashboardCourseStatusItem[];
  studentsOverview?: DashboardStudentsOverview;
  sales?: DashboardSales;
  topCourses?: DashboardTopCourse[];
  recentAccounts?: DashboardRecentAccount[];
}

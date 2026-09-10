import type {
  DashboardStatCards,
  DashboardPendingTasks,
  DashboardAcademicStructure,
  DashboardCourseStatusItem,
  DashboardStudentsOverview,
  DashboardSales,
  DashboardTopCourse,
  DashboardRecentAccount,
} from './dashboard';

export type WeeklyCollection = {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  isCurrentWeek: boolean;
  amount: number;
};

export type ReceiptFinancials = {
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  approvedAmount: number;
  pendingAmount: number;
  pendingReceiptsCount: number;
  rejectedAmount: number;
  verificationAccuracy: number;
};

export type TopInstructor = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  coursesCount: number;
  studentsCount: number;
  ratingAverage: number;
  ratingCount: number;
  publishedCoursesCount: number;
};

export type ReportsDataResponse = {
  dashboard: {
    statCards?: DashboardStatCards;
    pendingTasks?: DashboardPendingTasks;
    academicStructure?: DashboardAcademicStructure;
    courseStatusDistribution?: DashboardCourseStatusItem[];
    studentsOverview?: DashboardStudentsOverview;
    sales?: DashboardSales;
    topCourses?: DashboardTopCourse[];
    recentAccounts?: DashboardRecentAccount[];
  };
  weeklyCollections?: WeeklyCollection[];
  receiptFinancials?: ReceiptFinancials;
  topInstructors?: TopInstructor[];
};

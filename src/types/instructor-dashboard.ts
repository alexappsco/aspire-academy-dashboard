export interface StatCardsDto {
  earningsThisMonth: number;
  earningsSharePercent?: number | null;
  totalStudentsCount: number;
  newStudentsThisMonth: number;
  activeCoursesCount: number;
  pendingReviewCoursesCount: number;
}

export interface NeedsAttentionDto {
  rejectedCoursesCount: number;
  acceptedCoursesCount: number;
  pendingReviewCoursesCount: number;
  totalPendingTasksCount: number;
}

export interface CourseStatusSliceDto {
  status: string | number;
  count: number;
  percent: number;
}

export interface CourseStatusOverviewDto {
  totalCoursesCount: number;
  slices: CourseStatusSliceDto[];
}

export interface EnrollmentTrendPointDto {
  year: number;
  month: number;
  label: string;
  totalStudents: number;
}

export interface EnrollmentTrendDto {
  totalStudents: number;
  growthPercent?: number | null;
  points: EnrollmentTrendPointDto[];
}

export interface DashboardCourseCurrencyDto {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface DashboardCourseSpecializationDto {
  id: string;
  name: string;
}

export interface DashboardCourseItemDto {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type?: string;
  price: number;
  oldPrice?: number;
  currencyId?: string;
  currency?: DashboardCourseCurrencyDto;
  specializationId?: string;
  specialization?: DashboardCourseSpecializationDto;
  status: string | number;
  rejectionReason?: string;
  ratingAverage: number;
  ratingCount: number;
  studentsCount: number;
  lastUpdatedAt: string;
}

export interface DashboardCoursesListDto {
  items: DashboardCourseItemDto[];
  totalCount: number;
}

export interface ProfitOverviewDto {
  totalRevenue: number;
  instructorShare: number;
  instructorSharePercent?: number | null;
  platformShare: number;
  platformSharePercent?: number | null;
}

export interface InstructorDashboardDto {
  statCards: StatCardsDto;
  needsAttention: NeedsAttentionDto;
  courseStatusOverview: CourseStatusOverviewDto;
  enrollmentTrend: EnrollmentTrendDto;
  courses: DashboardCoursesListDto;
  profitOverview: ProfitOverviewDto;
}

export interface GetInstructorDashboardParams {
  SkipCount?: number;
  MaxResultCount?: number;
}

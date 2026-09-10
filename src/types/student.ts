export interface StudentCountryCurrency {
  id: string;
  name?: string;
  code?: string;
  symbol?: string;
}

export interface StudentCountry {
  id: string;
  name?: string;
  code?: string;
  currencyId?: string;
  currency?: StudentCountryCurrency | null;
}

export interface StudentItem {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  imageUrl?: string;
  graduationYear?: number;
  countryId?: string;
  country?: StudentCountry | null;
  isActive: boolean;
  lastActiveAt?: string;
  enrollmentsCount: number;
  completedCoursesCount: number;
  inProgressCoursesCount: number;
  totalPayments: number;
  pendingOrdersCount: number;
  creationTime: string;
}

export interface StudentListResponse {
  items: StudentItem[];
  totalCount: number;
}

export interface GetStudentsParams {
  IsActive?: boolean;
  CountryId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface StudentCourseItem {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseImageUrl?: string;
  specializationName?: string;
  instructorName?: string;
  enrolledAt?: string;
  expiresAt?: string;
  progressPercent: number;
  isCompleted: boolean;
  lastActivityAt?: string;
}

export interface StudentCourseListResponse {
  items: StudentCourseItem[];
  totalCount: number;
}

export interface StudentCourseProgressLesson {
  id: string;
  title: string;
  order: number;
  durationInSeconds: number;
  hasTest: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  lastPositionInSeconds?: number;
  isInProgress?: boolean;
}

export interface StudentCourseProgressChapter {
  id: string;
  title: string;
  order: number;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lessons: StudentCourseProgressLesson[];
}

export interface StudentCourseProgressResponse {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  courseImageUrl?: string | null;
  instructorName?: string | null;
  enrolledAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  totalDurationInSeconds: number;
  lastActivityAt?: string | null;
  chapters: StudentCourseProgressChapter[];
}

export interface GetStudentCoursesParams {
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface StudentOrderItemCourse {
  id: string;
  price: number;
  courseId?: string | null;
  courseTitle?: string | null;
  packageId?: string | null;
  packageName?: string | null;
}

export interface StudentOrderItem {
  id: string;
  userId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  status: 'Pending' | 'Paid' | 'Cancelled' | string;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  appliedCouponCode?: string | null;
  receiptUrl?: string | null;
  receiptVerified: boolean;
  items: StudentOrderItemCourse[];
  creationTime: string;
}

export interface StudentOrderListResponse {
  items: StudentOrderItem[];
  totalCount: number;
}

export interface GetStudentOrdersParams {
  Status?: string;
  InstructorId?: string;
  CourseId?: string;
  UserId?: string;
  StudentId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}


// UI / Legacy Domain Types for Dialogs and Details
export interface StudentMockItem {
  id: string;
  studentCode?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  avatar?: string;
  imageUrl?: string;
  joinedDate?: string;
  phoneNumber?: string;
  coursesCount?: number;
  progressPercent?: number;
  isActive?: boolean;
  country?: string | StudentCountry | null;
  city?: string;
  university?: string;
  college?: string;
  academicYear?: string;
  username?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  nationalId?: string;
  totalCourses?: number;
  completedCourses?: number;
  inProgressCourses?: number;
  totalPaid?: string;
  pendingReviews?: number;
}

export interface StudentEnrolledCourse {

  id: string;
  code?: string;
  title: string;
  lessonsInfo?: string;
  specialization?: string;
  instructor?: string;
  enrollmentDate?: string;
  progressPercent: number;
  progressText?: string;
  lastActivity?: string;
  status?: 'in_progress' | 'completed' | 'paused';
  statusText?: string;
}

export interface StudentOrderPayment {
  id: string;
  orderNumber: string;
  itemTitle: string;
  amount: string;
  orderDate: string;
  status: 'under_review' | 'paid_active';
  statusText: string;
}

export interface CourseProgressLesson {
  id: string;
  type: 'video' | 'pdf' | 'quiz' | 'article';
  title: string;
  meta: string;
  badge: string;
  isCompleted: boolean;
  progressPercent?: number;
  stoppedAt?: string;
}

export interface CourseProgressChapter {
  id: string;
  chapterNumber: number;
  title: string;
  badgeText: string;
  badgeType: 'completed' | 'in_progress';
  subtitle: string;
  lessons: CourseProgressLesson[];
}

export interface StudentCourseProgressData {
  courseCode: string;
  courseTitle: string;
  statusText: string;
  studentName: string;
  studentCode: string;
  instructorName: string;
  enrollmentDate: string;
  totalProgressPercent: number;
  completedLessons: string;
  remainingLessonsText: string;
  watchTime: string;
  watchTimeTotal: string;
  chapters: CourseProgressChapter[];
}


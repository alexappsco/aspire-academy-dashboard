export interface InstructorStudentItemDto {
  id: string;
  studentId: string;
  name: string;
  imageUrl?: string | null;
  email: string;
  coursesCount: number;
  lastEnrolledAt?: string | null;
}

export interface InstructorStudentListResponse {
  items: InstructorStudentItemDto[];
  totalCount: number;
}

export interface GetInstructorStudentsParams {
  CourseId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface InstructorStudentCountryDto {
  id: string;
  name: string;
  code: string;
  currencyId?: string | null;
  currency?: {
    id: string;
    name: string;
    code: string;
    symbol: string;
  } | null;
}

export interface InstructorStudentDetailDto {
  studentId: string;
  name: string;
  email: string;
  imageUrl?: string | null;
  graduationYear?: number | null;
  countryId?: string | null;
  country?: InstructorStudentCountryDto | null;
  isActive: boolean;
  lastActiveAt?: string | null;
  enrollmentsCount: number;
  completedCoursesCount: number;
  inProgressCoursesCount: number;
}

export interface InstructorStudentCourseItemDto {
  id: string;
  courseId: string;
  courseTitle: string;
  courseImageUrl?: string | null;
  enrolledAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  progressPercent: number;
}

export interface InstructorStudentCourseListResponse {
  items: InstructorStudentCourseItemDto[];
  totalCount: number;
}

export interface GetInstructorStudentCoursesParams {
  SkipCount?: number;
  MaxResultCount?: number;
}

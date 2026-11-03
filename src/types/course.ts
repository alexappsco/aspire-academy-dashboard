export interface CourseCurrency {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface CourseSpecialization {
  id: string;
  name: string;
}

export interface CourseFaculty {
  id: string;
  name: string;
}

export interface CourseField {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface CourseInstructor {
  id: string;
  name?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string;
  ratingAverage?: number;
  ratingCount?: number;
  coursesCount?: number;
  studentsCount?: number;
}

export interface CourseStudyMaterial {
  id: string;
  name: string;
  instructors?: CourseInstructor[];
}

export interface QuizChoice {
  id?: string;
  title: string;
  order: number;
  isRight: boolean;
}

export interface QuizQuestion {
  id?: string;
  text: string;
  explanation?: string;
  choices: QuizChoice[];
}

export interface LessonTest {
  id?: string;
  questions: QuizQuestion[];
}

export interface CourseLesson {
  id?: string;
  title: string;
  order: number;
  durationInSeconds?: number;
  videoUrl?: string;
  isFreePreview?: boolean;
  test?: LessonTest;
  attachmentIds?: string[];
}

export interface CourseChapter {
  id?: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseObjective {
  id?: string;
  text: string;
  order: number;
}

export enum CourseStatusEnum {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
}

export interface CourseCurriculum {
  chapters: CourseChapter[];
}

export interface CourseDto {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  imageUrl?: string;
  type?: string | number;
  price: number;
  oldPrice?: number;
  platformPercentage?: number;
  currencyId?: string;
  currency?: CourseCurrency;
  specializationId?: string;
  specialization?: CourseSpecialization;
  facultyId?: string;
  faculty?: CourseFaculty;
  studyMaterialId?: string;
  studyMaterial?: CourseStudyMaterial;
  instructorId?: string;
  instructor?: CourseInstructor;
  fieldId?: string;
  field?: CourseField;
  curriculum?: CourseCurriculum;
  objectives?: CourseObjective[];
  lessonCount?: number;
  totalDurationInSeconds?: number;
  accessDurationInDays?: number;
  studentsCount?: number;
  rating?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isActive?: boolean;
  status?: CourseStatusEnum | string | number;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  lastUpdatedAt?: string;
  creationTime?: string;
  lastModificationTime?: string;
}

export interface CoursesListResponse {
  totalCount: number;
  items: CourseDto[];
}

export interface GetCoursesParams {
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
  IsActive?: boolean;
  Status?: CourseStatusEnum | number;
  SpecializationId?: string;
  InstructorId?: string;
}

export interface CourseReviewPayload {
  accept: boolean;
  rejectionReason?: string;
  price?: number;
  oldPrice?: number;
  currencyId?: string;
  platformPercentage?: number;
}

/**
 * A student enrolled in a specific course (GET /admin/courses/{id}/students).
 * `studentId` is the id the bulk access endpoints expect — it is NOT the order
 * `userId`, so it has to come from this listing.
 */
export interface CourseStudentItem {
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  imageUrl?: string | null;
  /** Account exists and is not suspended. */
  isAccountActive: boolean;
  enrolledAt?: string | null;
  expiresAt?: string | null;
  /** Course access state — the thing the bulk activate/deactivate endpoints flip. */
  isCourseAccessActive: boolean;
  isCompleted: boolean;
}

export interface CourseStudentListResponse {
  items: CourseStudentItem[];
  totalCount: number;
}

export interface GetCourseStudentsParams {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

/** Per-student outcome returned by the bulk access endpoints. */
export interface CourseStudentBulkFailure {
  id: string;
  message: string;
}

export interface CourseStudentBulkResult {
  total: number;
  succeededCount: number;
  failedCount: number;
  succeeded?: string[];
  failed?: CourseStudentBulkFailure[];
}

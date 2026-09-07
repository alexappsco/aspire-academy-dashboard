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
}

export interface CourseInstructor {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
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
  studentsCount?: number;
  rating?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isActive?: boolean;
  status?: string;
  rejectionReason?: string;
  reviewedAt?: string;
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
  SpecializationId?: string;
  InstructorId?: string;
}

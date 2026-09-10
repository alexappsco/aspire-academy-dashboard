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

// ── Create Course Form Types ──────────────────────────────

export const COURSE_TYPE_MAP: Record<string, number> = {
  Full: 1,
  MidTerm: 2,
  Final: 3,
};

export type CoursePayloadMode = 'json' | 'indexed';

export interface CurriculumChapterRequest {
  title: string | null;
  order: number;
  lessons: CurriculumLessonRequest[];
}

export interface CurriculumLessonRequest {
  title: string | null;
  order: number;
  durationInSeconds: number;
  videoUrl: string | null;
  isFreePreview: boolean;
  attachmentIds: string[];
  test: LessonTestRequest | null;
}

export interface LessonTestRequest {
  questions: QuizQuestionRequest[];
}

export interface QuizQuestionRequest {
  text: string | null;
  explanation: string | null;
  choices: QuizChoiceRequest[];
}

export interface QuizChoiceRequest {
  title: string | null;
  order: number;
  isRight: boolean;
}

export interface CourseObjectiveRequest {
  textAr: string;
  textEn: string;
  order: number;
}

export interface CourseCreatePayload {
  title: string;
  description: string;
  type: number;
  price: string;
  oldPrice: string;
  accessDurationInDays: string;
  currencyId?: string;
  instructorId: string;
  fieldId: string;
  specializationId?: string;
  facultyId?: string;
  studyMaterialId?: string;
  image?: File;
  objectives: CourseObjectiveRequest[];
  curriculum: { chapters: CurriculumChapterRequest[] };
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
  attachments?: { url: string; fileName: string }[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

export interface LessonDoc {
  id: string;
  name: string;
  url: string;
}

export interface LessonQuizOption {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonQuizQuestion {
  id: string;
  number: number;
  title: string;
  points: number;
  options: LessonQuizOption[];
  explanation: string;
}

export interface LessonQuiz {
  title: string;
  questions: LessonQuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  videoUrl?: string;
  videoName?: string;
  documents: LessonDoc[];
  quiz: LessonQuiz | null;
}

// ── Rich (UI) Chapter Types ───────────────────────────────

export interface AttachmentItem {
  id: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  badgeText: string;
  metaText: string;
  questionsCount?: number;
  url?: string;
  isUploading?: boolean;
  quiz?: LessonQuiz;
}

export interface RichLesson {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  attachments: AttachmentItem[];
}

export interface RichChapter {
  id: string;
  number: number;
  title: string;
  isExpanded: boolean;
  lessons: RichLesson[];
}

export interface LearningObjective {
  id: string;
  textAr: string;
  textEn: string;
  order: number;
}

export interface CourseFormValues {
  title: string;
  description: string;
  image: File | string | null;
  type: string;
  price: string;
  oldPrice: string;
  accessDurationInDays: string;
  currencyId: string;
  specializationId: string;
  facultyId: string;
  studyMaterialId: string;
  instructorId: string;
  fieldId: string;
  universityId: string;
  academicYearId: string;
  semesterId: string;
  learningObjectives: LearningObjective[];
  chapters: Chapter[];
}

export interface OptionItem {
  value: string;
  label_ar: string;
  label_en: string;
}

export interface EnrollmentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
  progress: number;
  status: 'in_progress' | 'completed';
}

export interface ReviewItem {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
}

export interface CourseObjective {
  id?: string;
  text: string;
  order: number;
}

export interface CourseDetailsData {
  id: string;
  title_ar: string;
  title_en: string;
  specialty_ar: string;
  specialty_en: string;
  lecturer_ar: string;
  lecturer_en: string;
  status: 'published' | 'unpublished';
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  duration: string;
  price: string;
  oldPrice: string;
  currencySymbol: string;
  type: string | number;
  field_ar: string;
  field_en: string;
  faculty_ar: string;
  faculty_en: string;
  studyMaterial_ar: string;
  studyMaterial_en: string;
  accessDurationInDays: number;
  lastUpdated: string;
  publishDate_ar: string;
  publishDate_en: string;
  imageUrl: string;
  totalStudents: string;
  studentsGrowth: string;
  completionRate: number;
  avgRating: string;
  totalRevenue: string;
  description_ar: string;
  description_en: string;
  chaptersCount: number;
  videosCount: number;
  quizzesCount: number;
  resourcesCount: number;
  objectives: CourseObjective[];
  recentEnrollments: EnrollmentItem[];
  recentReviews: ReviewItem[];
  curriculum?: CourseCurriculum | null;
}

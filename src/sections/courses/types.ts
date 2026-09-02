export interface Lesson {
  id: string;
  title: string;
  hasVideo: boolean;
  videoFile?: File;
  videoName?: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

export interface LearningObjective {
  id: string;
  title: string;
}

export interface CourseFormValues {
  name: string;
  field: string;
  currentPrice: string;
  oldPrice: string;
  lecturer: string;
  college: string;
  subject: string;
  specialty: string;
  duration: string;
  courseType: string;
  description: string;
  learningObjectives: LearningObjective[];
  thumbnail: File | string | null;
  cover: File | string | null;
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
  recentEnrollments: EnrollmentItem[];
  recentReviews: ReviewItem[];
}

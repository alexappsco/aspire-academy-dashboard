export interface StudentItem {
  id: string;
  studentCode: string;
  nameAr: string;
  nameEn: string;
  avatar?: string;
  joinedDate: string;
  phoneNumber: string;
  coursesCount: number;
  progressPercent: number;
  isActive: boolean;
  country: string;
  city: string;
  university: string;
  college: string;
  academicYear: string;
  username: string;
  email: string;
  birthDate: string;
  gender: string;
  nationalId: string;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalPaid: string;
  pendingReviews: number;
}

export interface StudentEnrolledCourse {
  id: string;
  code: string;
  title: string;
  lessonsInfo: string;
  specialization: string;
  instructor: string;
  enrollmentDate: string;
  progressPercent: number;
  progressText: string;
  lastActivity: string;
  status: 'in_progress' | 'completed' | 'paused';
  statusText: string;
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

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

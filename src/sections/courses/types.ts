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

export interface CourseFormValues {
  name: string;
  price: string;
  lecturer: string;
  college: string;
  subject: string;
  specialty: string;
  category: string;
  field: string;
  description: string;
  thumbnail: File | string | null;
  cover: File | string | null;
  chapters: Chapter[];
}

export interface OptionItem {
  value: string;
  label_ar: string;
  label_en: string;
}

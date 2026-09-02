export type MinutesStatus = 'draft' | 'published' | 'archived';

export interface MinutesItem {
  id: string;
  name_ar: string;
  name_en: string;
  email: string;
  avatar: string;
  joinedDate: string;
  specialty: string;
  subject: string;
  coursesCount: number;
  studentsCount: string;
  rating: number;
  status: MinutesStatus;
  active: boolean;
}

export const MOCK_MINUTES: MinutesItem[] = [
  {
    id: '1',
    name_ar: 'د. على محمد',
    name_en: 'Dr. Ali Mohamed',
    email: 'alimoha.e@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer1',
    joinedDate: '05-08-2026',
    specialty: 'Cardiology',
    subject: 'الباطنة',
    coursesCount: 6,
    studentsCount: '1.240',
    rating: 4.2,
    status: 'published',
    active: true,
  },
  {
    id: '2',
    name_ar: 'د. أحمد خالد',
    name_en: 'Dr. Ahmed Khalid',
    email: 'ahmed.k@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer2',
    joinedDate: '10-07-2026',
    specialty: 'Orthopedic Surgery',
    subject: 'جراحة العظام',
    coursesCount: 4,
    studentsCount: '890',
    rating: 4.5,
    status: 'published',
    active: true,
  },
  {
    id: '3',
    name_ar: 'د. فاطمة أحمد',
    name_en: 'Dr. Fatima Ahmed',
    email: 'fatima.a@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer3',
    joinedDate: '15-06-2026',
    specialty: 'Pediatrics',
    subject: 'طب الأطفال',
    coursesCount: 5,
    studentsCount: '1.560',
    rating: 4.8,
    status: 'published',
    active: true,
  },
  {
    id: '4',
    name_ar: 'د. سارة العلي',
    name_en: 'Dr. Sara Al-Ali',
    email: 'sara.a@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer4',
    joinedDate: '20-05-2026',
    specialty: 'Dermatology',
    subject: 'الأمراض الجلدية',
    coursesCount: 3,
    studentsCount: '720',
    rating: 4.1,
    status: 'draft',
    active: true,
  },
  {
    id: '5',
    name_ar: 'د. محمد حسين',
    name_en: 'Dr. Mohamed Hussein',
    email: 'mohamed.h@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer5',
    joinedDate: '01-04-2026',
    specialty: 'Emergency Medicine',
    subject: 'طب الطوارئ',
    coursesCount: 7,
    studentsCount: '2.100',
    rating: 4.6,
    status: 'archived',
    active: false,
  },
  {
    id: '6',
    name_ar: 'د. خالد العمري',
    name_en: 'Dr. Khaled Al-Omari',
    email: 'khaled.o@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer6',
    joinedDate: '12-03-2026',
    specialty: 'Internal Medicine',
    subject: 'الباطنة العامة',
    coursesCount: 8,
    studentsCount: '1.890',
    rating: 4.3,
    status: 'published',
    active: true,
  },
  {
    id: '7',
    name_ar: 'د. نورة الشمري',
    name_en: 'Dr. Noura Al-Shammari',
    email: 'noura.s@gm...',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lecturer7',
    joinedDate: '28-02-2026',
    specialty: 'Neurology',
    subject: 'طب الأعصاب',
    coursesCount: 3,
    studentsCount: '540',
    rating: 4.7,
    status: 'published',
    active: true,
  },
];

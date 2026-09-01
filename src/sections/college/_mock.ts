import { UniversityItem, MOCK_UNIVERSITIES } from '../university/_mock';

export interface CollegeItem {
  id: string;
  logo: string;
  name_ar: string;
  name_en: string;
  universityId: string;
  order: number;
  createdDate_ar: string;
  createdDate_en: string;
  active: boolean;
}

export const getUniversityName = (
  universityId: string,
  locale: string
): string => {
  const university = MOCK_UNIVERSITIES.find((u) => u.id === universityId);
  if (!university) return '';
  return locale === 'ar' ? university.name_ar : university.name_en;
};

export const MOCK_COLLEGES: CollegeItem[] = [
  {
    id: '1',
    logo: '/icons/course.svg',
    name_ar: 'كلية الطب',
    name_en: 'Faculty of Medicine',
    universityId: '1',
    order: 1,
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '2',
    logo: '/icons/curriculum.svg',
    name_ar: 'كلية الهندسة',
    name_en: 'Faculty of Engineering',
    universityId: '1',
    order: 2,
    createdDate_ar: '30/8/2026',
    createdDate_en: '30/8/2026',
    active: true,
  },
  {
    id: '3',
    logo: '/icons/booking.svg',
    name_ar: 'كلية الحاسب',
    name_en: 'Faculty of Computer Science',
    universityId: '2',
    order: 3,
    createdDate_ar: '28/8/2026',
    createdDate_en: '28/8/2026',
    active: true,
  },
  {
    id: '4',
    logo: '/icons/finance.svg',
    name_ar: 'كلية إدارة الأعمال',
    name_en: 'Faculty of Business Administration',
    universityId: '3',
    order: 4,
    createdDate_ar: '25/8/2026',
    createdDate_en: '25/8/2026',
    active: false,
  },
  {
    id: '5',
    logo: '/icons/package.svg',
    name_ar: 'كلية الصيدلة',
    name_en: 'Faculty of Pharmacy',
    universityId: '2',
    order: 5,
    createdDate_ar: '20/8/2026',
    createdDate_en: '20/8/2026',
    active: true,
  },
  {
    id: '6',
    logo: '/icons/invoice.svg',
    name_ar: 'كلية الحقوق',
    name_en: 'Faculty of Law',
    universityId: '4',
    order: 6,
    createdDate_ar: '18/8/2026',
    createdDate_en: '18/8/2026',
    active: true,
  },
];

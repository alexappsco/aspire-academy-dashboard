import { MOCK_UNIVERSITIES } from '../university/_mock';
import { MOCK_COLLEGES } from '../college/_mock';

export interface SubjectItem {
  id: string;
  logo: string;
  name_ar: string;
  name_en: string;
  universityId: string;
  collegeId: string;
  order: number;
  createdDate_ar: string;
  createdDate_en: string;
  active: boolean;
}

export const getUniversityName = (id: string, locale: string): string => {
  const item = MOCK_UNIVERSITIES.find((u) => u.id === id);
  if (!item) return '';
  return locale === 'ar' ? item.name_ar : item.name_en;
};

export const getCollegeName = (id: string, locale: string): string => {
  const item = MOCK_COLLEGES.find((c) => c.id === id);
  if (!item) return '';
  return locale === 'ar' ? item.name_ar : item.name_en;
};

export const MOCK_SUBJECTS: SubjectItem[] = [
  {
    id: '1',
    logo: '/icons/course.svg',
    name_ar: 'تشريح الإنسان',
    name_en: 'Human Anatomy',
    universityId: '1',
    collegeId: '1',
    order: 1,
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '2',
    logo: '/icons/curriculum.svg',
    name_ar: 'فيزياء المباني',
    name_en: 'Building Physics',
    universityId: '1',
    collegeId: '2',
    order: 2,
    createdDate_ar: '30/8/2026',
    createdDate_en: '30/8/2026',
    active: true,
  },
  {
    id: '3',
    logo: '/icons/booking.svg',
    name_ar: 'هياكل البيانات',
    name_en: 'Data Structures',
    universityId: '2',
    collegeId: '3',
    order: 3,
    createdDate_ar: '28/8/2026',
    createdDate_en: '28/8/2026',
    active: true,
  },
  {
    id: '4',
    logo: '/icons/finance.svg',
    name_ar: 'المحاسبة المالية',
    name_en: 'Financial Accounting',
    universityId: '3',
    collegeId: '4',
    order: 4,
    createdDate_ar: '25/8/2026',
    createdDate_en: '25/8/2026',
    active: false,
  },
  {
    id: '5',
    logo: '/icons/package.svg',
    name_ar: 'كيمياء الصيدلة',
    name_en: 'Pharmaceutical Chemistry',
    universityId: '2',
    collegeId: '5',
    order: 5,
    createdDate_ar: '20/8/2026',
    createdDate_en: '20/8/2026',
    active: true,
  },
  {
    id: '6',
    logo: '/icons/invoice.svg',
    name_ar: 'القانون المدني',
    name_en: 'Civil Law',
    universityId: '4',
    collegeId: '6',
    order: 6,
    createdDate_ar: '18/8/2026',
    createdDate_en: '18/8/2026',
    active: true,
  },
];

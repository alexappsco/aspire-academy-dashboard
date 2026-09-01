export interface UniversityItem {
  id: string;
  logo: string;
  name_ar: string;
  name_en: string;
  country_ar: string;
  country_en: string;
  order: number;
  createdDate_ar: string;
  createdDate_en: string;
  active: boolean;
}

export const MOCK_UNIVERSITIES: UniversityItem[] = [
  {
    id: '1',
    logo: '/icons/course.svg',
    name_ar: 'جامعة الكويت',
    name_en: 'Kuwait University',
    country_ar: 'الكويت',
    country_en: 'Kuwait',
    order: 1,
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '2',
    logo: '/icons/curriculum.svg',
    name_ar: 'جامعة القاهرة',
    name_en: 'Cairo University',
    country_ar: 'مصر',
    country_en: 'Egypt',
    order: 2,
    createdDate_ar: '30/8/2026',
    createdDate_en: '30/8/2026',
    active: true,
  },
  {
    id: '3',
    logo: '/icons/booking.svg',
    name_ar: 'جامعة الملك سعود',
    name_en: 'King Saud University',
    country_ar: 'السعودية',
    country_en: 'Saudi Arabia',
    order: 3,
    createdDate_ar: '28/8/2026',
    createdDate_en: '28/8/2026',
    active: true,
  },
  {
    id: '4',
    logo: '/icons/finance.svg',
    name_ar: 'جامعة الإمارات',
    name_en: 'University of Emirates',
    country_ar: 'الإمارات',
    country_en: 'UAE',
    order: 4,
    createdDate_ar: '25/8/2026',
    createdDate_en: '25/8/2026',
    active: false,
  },
  {
    id: '5',
    logo: '/icons/package.svg',
    name_ar: 'جامعة البحرين',
    name_en: 'University of Bahrain',
    country_ar: 'البحرين',
    country_en: 'Bahrain',
    order: 5,
    createdDate_ar: '20/8/2026',
    createdDate_en: '20/8/2026',
    active: true,
  },
  {
    id: '6',
    logo: '/icons/invoice.svg',
    name_ar: 'جامعة عمان',
    name_en: 'University of Jordan',
    country_ar: 'الأردن',
    country_en: 'Jordan',
    order: 6,
    createdDate_ar: '18/8/2026',
    createdDate_en: '18/8/2026',
    active: true,
  },
];

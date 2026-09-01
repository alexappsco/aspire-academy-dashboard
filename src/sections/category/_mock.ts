export interface CategoryItem {
  id: string;
  name_ar: string;
  name_en: string;
  image: string;
  order: number;
  createdDate_ar: string;
  createdDate_en: string;
  active: boolean;
}

export const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    name_ar: 'طب الأسنان',
    name_en: 'Dentistry',
    image: '/icons/course.svg',
    order: 1,
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '2',
    name_ar: 'الصيدلة',
    name_en: 'Pharmacy',
    image: '/icons/curriculum.svg',
    order: 2,
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '3',
    name_ar: 'العلاج الطبيعي',
    name_en: 'Physical Therapy',
    image: '/icons/booking.svg',
    order: 3,
    createdDate_ar: '30/8/2026',
    createdDate_en: '30/8/2026',
    active: true,
  },
  {
    id: '4',
    name_ar: 'التمريض',
    name_en: 'Nursing',
    image: '/icons/finance.svg',
    order: 4,
    createdDate_ar: '28/8/2026',
    createdDate_en: '28/8/2026',
    active: false,
  },
  {
    id: '5',
    name_ar: 'طب الأطفال',
    name_en: 'Pediatrics',
    image: '/icons/package.svg',
    order: 5,
    createdDate_ar: '25/8/2026',
    createdDate_en: '25/8/2026',
    active: true,
  },
  {
    id: '6',
    name_ar: 'جراحة العظام',
    name_en: 'Orthopedic Surgery',
    image: '/icons/invoice.svg',
    order: 6,
    createdDate_ar: '20/8/2026',
    createdDate_en: '20/8/2026',
    active: true,
  },
];

export interface BannerItem {
  id: string;
  title_ar: string;
  title_en: string;
  image: string;
  startDate: string;
  endDate: string;
  createdDate_ar: string;
  createdDate_en: string;
  active: boolean;
}

export const MOCK_BANNERS: BannerItem[] = [
  {
    id: '1',
    title_ar: 'طب الأسنان',
    title_en: 'Dentistry',
    image: '/icons/course.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '2',
    title_ar: 'العلاج الطبيعي',
    title_en: 'Physiotherapy',
    image: '/icons/curriculum.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    createdDate_ar: '31/8/2026',
    createdDate_en: '31/8/2026',
    active: true,
  },
  {
    id: '3',
    title_ar: 'طب الأطفال',
    title_en: 'Pediatrics',
    image: '/icons/booking.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    createdDate_ar: '30/8/2026',
    createdDate_en: '30/8/2026',
    active: false,
  },
  {
    id: '4',
    title_ar: 'جراحة العظام',
    title_en: 'Orthopedic Surgery',
    image: '/icons/finance.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-28',
    createdDate_ar: '28/8/2026',
    createdDate_en: '28/8/2026',
    active: true,
  },
  {
    id: '5',
    title_ar: 'طب الطوارئ',
    title_en: 'Emergency Medicine',
    image: '/icons/package.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    createdDate_ar: '25/8/2026',
    createdDate_en: '25/8/2026',
    active: true,
  },
  {
    id: '6',
    title_ar: 'أمراض القلب',
    title_en: 'Cardiology',
    image: '/icons/invoice.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    createdDate_ar: '20/8/2026',
    createdDate_en: '20/8/2026',
    active: false,
  },
  {
    id: '7',
    title_ar: 'طب الأعصاب',
    title_en: 'Neurology',
    image: '/icons/reports.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-18',
    createdDate_ar: '18/8/2026',
    createdDate_en: '18/8/2026',
    active: true,
  },
  {
    id: '8',
    title_ar: 'المختبر الطبي',
    title_en: 'Medical Laboratory',
    image: '/icons/profile.svg',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    createdDate_ar: '15/8/2026',
    createdDate_en: '15/8/2026',
    active: true,
  },
];

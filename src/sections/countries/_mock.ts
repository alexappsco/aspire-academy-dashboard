export interface CountryItem {
  id: string;
  order: number;
  name_ar: string;
  name_en: string;
  active: boolean;
}

export const MOCK_COUNTRIES: CountryItem[] = [
  { id: '1', order: 1, name_ar: 'مصر', name_en: 'Egypt', active: true },
  { id: '2', order: 2, name_ar: 'الكويت', name_en: 'Kuwait', active: true },
  { id: '3', order: 3, name_ar: 'المملكة العربية السعودية', name_en: 'Saudi Arabia', active: true },
  { id: '4', order: 4, name_ar: 'الإمارات العربية المتحدة', name_en: 'United Arab Emirates', active: true },
  { id: '5', order: 5, name_ar: 'قطر', name_en: 'Qatar', active: true },
  { id: '6', order: 6, name_ar: 'عمان', name_en: 'Oman', active: true },
  { id: '7', order: 7, name_ar: 'البحرين', name_en: 'Bahrain', active: true },
  { id: '8', order: 8, name_ar: 'الأردن', name_en: 'Jordan', active: true },
  { id: '9', order: 9, name_ar: 'العراق', name_en: 'Iraq', active: false },
  { id: '10', order: 10, name_ar: 'المغرب', name_en: 'Morocco', active: true },
  { id: '11', order: 11, name_ar: 'تونس', name_en: 'Tunisia', active: false },
  { id: '12', order: 12, name_ar: 'لبنان', name_en: 'Lebanon', active: true },
];

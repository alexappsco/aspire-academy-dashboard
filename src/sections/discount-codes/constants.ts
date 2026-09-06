import { CouponType } from './types';

export const DEFAULT_PAGE_SIZE = 10;

export const DISCOUNT_TYPE_LABELS: Record<CouponType, Record<'en' | 'ar', string>> = {
  Fixed: { en: 'Fixed', ar: 'مبلغ ثابت' },
  Percentage: { en: 'Percantage', ar: 'نسبة مئوية' },
};

export const DISCOUNT_TYPE_STYLES: Record<
  CouponType,
  { bgcolor: string; color: string }
> = {
  Fixed: {
    bgcolor: 'rgba(33, 150, 243, 0.12)',
    color: 'rgb(25, 118, 210)',
  },
  Percentage: {
    bgcolor: 'rgba(76, 175, 80, 0.12)',
    color: 'rgb(56, 142, 60)',
  },
};

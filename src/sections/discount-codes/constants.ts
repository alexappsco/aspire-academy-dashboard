import type { DiscountType } from './_mock';

export const DEFAULT_PAGE_SIZE = 10;

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: 'نسبة مئوية',
  fixed: 'مبلغ ثابت',
};

export const DISCOUNT_TYPE_STYLES: Record<
  DiscountType,
  { bgcolor: string; color: string }
> = {
  percentage: {
    bgcolor: 'rgba(76, 175, 80, 0.12)',
    color: 'rgb(56, 142, 60)',
  },
  fixed: {
    bgcolor: 'rgba(33, 150, 243, 0.12)',
    color: 'rgb(25, 118, 210)',
  },
};

export interface DiscountCodeItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  usedCount: number;
  active: boolean;
}

export type DiscountType = 'percentage' | 'fixed';

export const MOCK_DISCOUNT_CODES: DiscountCodeItem[] = [
  {
    id: '1',
    code: '986163',
    type: 'fixed',
    value: 50,
    startDate: '15/4/2026',
    endDate: '20/4/2026',
    maxUsage: 5,
    usedCount: 1,
    active: true,
  },
  {
    id: '2',
    code: '750302',
    type: 'percentage',
    value: 20,
    startDate: '01/5/2026',
    endDate: '10/5/2026',
    maxUsage: 10,
    usedCount: 3,
    active: true,
  },
  {
    id: '3',
    code: '220119',
    type: 'fixed',
    value: 100,
    startDate: '21/4/2026',
    endDate: '30/4/2026',
    maxUsage: 3,
    usedCount: 2,
    active: false,
  },
  {
    id: '4',
    code: '339918',
    type: 'percentage',
    value: 15,
    startDate: '11/5/2026',
    endDate: '25/5/2026',
    maxUsage: 8,
    usedCount: 0,
    active: true,
  },
  {
    id: '5',
    code: '881245',
    type: 'fixed',
    value: 75,
    startDate: '01/6/2026',
    endDate: '15/6/2026',
    maxUsage: 12,
    usedCount: 4,
    active: false,
  },
  {
    id: '6',
    code: '445567',
    type: 'percentage',
    value: 30,
    startDate: '10/6/2026',
    endDate: '20/6/2026',
    maxUsage: 6,
    usedCount: 6,
    active: true,
  },
];

export type CouponType = 'Fixed' | 'Percentage';

export const COUPON_TYPE_MAP: Record<number, CouponType> = {
  1: 'Fixed',
  2: 'Percentage',
};

export const COUPON_TYPE_REVERSE: Record<CouponType, number> = {
  Fixed: 1,
  Percentage: 2,
};

export interface CouponDto {
  id: string;
  code: string;
  type: number;
  value: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  startAt: string;
  endAt: string;
  maxRedemptions: number;
  redemptionCount: number;
  maxRedemptionsPerStudent: number;
  isActive: boolean;
}

export interface CouponsListResponse {
  totalCount: number;
  items: CouponDto[];
}

export interface GetCouponsParams {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateCouponDto {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  startAt: string;
  endAt: string;
  maxRedemptions: number;
  maxRedemptionsPerStudent: number;
  isActive: boolean;
}

export interface UpdateCouponDto {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  startAt: string;
  endAt: string;
  maxRedemptions: number;
  maxRedemptionsPerStudent: number;
  isActive: boolean;
}

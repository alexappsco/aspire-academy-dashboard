export type CouponType = 'Fixed' | 'Percentage';

export const COUPON_TYPE_MAP: Record<number, CouponType> = {
  1: 'Fixed',
  2: 'Percentage',
};

export const COUPON_TYPE_REVERSE: Record<CouponType, number> = {
  Fixed: 1,
  Percentage: 2,
};

export interface InstructorCouponDto {
  id: string;
  code: string;
  instructorId?: string;
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

export interface InstructorCouponsListResponse {
  totalCount: number;
  items: InstructorCouponDto[];
}

export interface GetInstructorCouponsParams {
  IsActive?: boolean;
  InstructorId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateInstructorCouponDto {
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

export interface UpdateInstructorCouponDto {
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

'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  CouponDto,
  CouponsListResponse,
  GetCouponsParams,
  CreateCouponDto,
  UpdateCouponDto,
} from 'src/sections/discount-codes/types';

export async function getCouponsAction(
  params?: GetCouponsParams
): Promise<{ success: boolean; data?: CouponsListResponse; error?: string }> {
  try {
    let endpoint = endpoints.coupons.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.Sorting) {
        searchParams.append('Sorting', params.Sorting);
      }

      if (typeof params.SkipCount === 'number') {
        searchParams.append('SkipCount', String(params.SkipCount));
      }

      if (typeof params.MaxResultCount === 'number') {
        searchParams.append('MaxResultCount', String(params.MaxResultCount));
      }

      const query = searchParams.toString();
      if (query) {
        endpoint += `?${query}`;
      }
    }

    const res = await getData<CouponsListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch coupons';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch coupons',
    };
  }
}

export async function getCouponByIdAction(
  id: string
): Promise<{ success: boolean; data?: CouponDto; error?: string }> {
  try {
    const res = await getData<CouponDto>(endpoints.coupons.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get coupon',
    };
  }
}

export async function createCouponAction(
  data: CreateCouponDto
): Promise<{ success: boolean; data?: CouponDto; error?: string }> {
  try {
    const res = await postData<CouponDto, CreateCouponDto>(endpoints.coupons.create, data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create coupon',
    };
  }
}

export async function updateCouponAction(
  id: string,
  data: UpdateCouponDto
): Promise<{ success: boolean; data?: CouponDto; error?: string }> {
  try {
    const res = await editData<CouponDto, UpdateCouponDto>(endpoints.coupons.update(id), 'PUT', data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update coupon',
    };
  }
}

export async function deleteCouponAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.coupons.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete coupon',
    };
  }
}

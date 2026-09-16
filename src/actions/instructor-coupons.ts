'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  InstructorCouponDto,
  InstructorCouponsListResponse,
  GetInstructorCouponsParams,
  CreateInstructorCouponDto,
  UpdateInstructorCouponDto,
} from 'src/types/instructor-coupon';

export async function getInstructorCouponsAction(
  params?: GetInstructorCouponsParams
): Promise<{ success: boolean; data?: InstructorCouponsListResponse; error?: string }> {
  try {
    let endpoint = endpoints.instructorCoupons.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.InstructorId) {
        searchParams.append('InstructorId', params.InstructorId);
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

    const res = await getData<InstructorCouponsListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch instructor coupons';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch instructor coupons',
    };
  }
}

export async function getInstructorCouponByIdAction(
  id: string
): Promise<{ success: boolean; data?: InstructorCouponDto; error?: string }> {
  try {
    const res = await getData<InstructorCouponDto>(endpoints.instructorCoupons.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get instructor coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get instructor coupon',
    };
  }
}

export async function createInstructorCouponAction(
  data: CreateInstructorCouponDto
): Promise<{ success: boolean; data?: InstructorCouponDto; error?: string }> {
  try {
    const res = await postData<InstructorCouponDto, CreateInstructorCouponDto>(
      endpoints.instructorCoupons.create,
      data
    );
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create instructor coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create instructor coupon',
    };
  }
}

export async function updateInstructorCouponAction(
  id: string,
  data: UpdateInstructorCouponDto
): Promise<{ success: boolean; data?: InstructorCouponDto; error?: string }> {
  try {
    const res = await editData<InstructorCouponDto, UpdateInstructorCouponDto>(
      endpoints.instructorCoupons.update(id),
      'PUT',
      data
    );
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update instructor coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update instructor coupon',
    };
  }
}

export async function deleteInstructorCouponAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.instructorCoupons.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete instructor coupon';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete instructor coupon',
    };
  }
}

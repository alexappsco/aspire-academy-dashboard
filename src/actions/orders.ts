'use server';

import { getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { GetOrdersParams, OrderDto, OrdersListResponse } from 'src/types/order';

function toQueryString(params?: GetOrdersParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  const append = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.append(key, String(value));
    }
  };

  append('Status', params.Status);
  append('InstructorId', params.InstructorId);
  append('CourseId', params.CourseId);
  append('UserId', params.UserId);
  append('StudentId', params.StudentId);
  append('Filter', params.Filter);
  append('Sorting', params.Sorting);
  append('SkipCount', params.SkipCount);
  append('MaxResultCount', params.MaxResultCount);

  return search.toString();
}

export async function getOrders(
  params?: GetOrdersParams
): Promise<ApiSingleResponse<OrdersListResponse>> {
  try {
    const query = toQueryString(params);
    const endpoint = query ? `${endpoints.orders.list}?${query}` : endpoints.orders.list;
    const res = await getData<OrdersListResponse>(endpoint);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch orders';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };
  }
}

export async function approveOrder(id: string): Promise<ApiSingleResponse<OrderDto>> {
  try {
    const res = await postData<OrderDto, Record<string, never>>(endpoints.orders.approve(id), {});
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to approve order';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve order',
    };
  }
}

export async function rejectOrder(
  id: string,
  reason: string
): Promise<ApiSingleResponse<OrderDto>> {
  try {
    const res = await postData<OrderDto, { reason: string }>(endpoints.orders.reject(id), {
      reason,
    });
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to reject order';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject order',
    };
  }
}
'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  GetHoursChargeRequestsParams,
  HoursChargeRequestsListResponse,
  HoursChargeRequestDetails,
  HoursChargeRequestStatusCounts,
} from 'src/types/hours-charge-request';
import { getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

function buildListQuery(params?: GetHoursChargeRequestsParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  const append = (key: string, value: string | number | undefined) => {
    if (value !== undefined && String(value).trim() !== '') searchParams.append(key, String(value));
  };
  append('Status', params.Status);
  append('CountryId', params.CountryId);
  append('FromDate', params.FromDate);
  append('Filter', params.Filter?.trim());
  append('SkipCount', params.SkipCount);
  append('MaxResultCount', params.MaxResultCount);
  return searchParams.toString();
}

export async function getHoursChargeRequests(
  params?: GetHoursChargeRequestsParams
): Promise<ApiSingleResponse<HoursChargeRequestsListResponse>> {
  try {
    const query = buildListQuery(params);
    const endpoint = query
      ? `${endpoints.hoursChargeRequests.list}?${query}`
      : endpoints.hoursChargeRequests.list;
    const response = await getData<HoursChargeRequestsListResponse>(endpoint);
    if ('success' in response && response.success) return { success: true, data: response.data };
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load hours charge requests',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load hours charge requests',
    };
  }
}

export async function getHoursChargeRequestStatusCounts(): Promise<
  ApiSingleResponse<HoursChargeRequestStatusCounts>
> {
  try {
    const response = await getData<HoursChargeRequestStatusCounts>(
      endpoints.hoursChargeRequests.statusCounts
    );
    if ('success' in response && response.success) return { success: true, data: response.data };
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load request status counts',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load request status counts',
    };
  }
}

export async function getHoursChargeRequestById(
  id: string
): Promise<ApiSingleResponse<HoursChargeRequestDetails>> {
  try {
    const response = await getData<HoursChargeRequestDetails>(
      endpoints.hoursChargeRequests.details(id)
    );

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load hours charge request',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load hours charge request',
    };
  }
}

export async function approveHoursChargeRequest(
  id: string
): Promise<ApiSingleResponse<HoursChargeRequestDetails>> {
  try {
    const response = await postData<HoursChargeRequestDetails, Record<string, never>>(
      endpoints.hoursChargeRequests.approve(id),
      {}
    );
    if ('success' in response && response.success) return { success: true, data: response.data };
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to approve hours charge request',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve hours charge request',
    };
  }
}

export async function rejectHoursChargeRequest(
  id: string,
  reason: string
): Promise<ApiSingleResponse<HoursChargeRequestDetails>> {
  try {
    const response = await postData<HoursChargeRequestDetails, { reason: string }>(
      endpoints.hoursChargeRequests.reject(id),
      { reason: reason.trim() }
    );
    if ('success' in response && response.success) return { success: true, data: response.data };
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to reject hours charge request',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject hours charge request',
    };
  }
}

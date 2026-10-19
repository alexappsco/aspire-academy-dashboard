'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  AdminSessionRequest,
  AdminSessionRequestsListResponse,
  GetAdminSessionRequestsParams,
} from 'src/types/admin-session-request';
import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

function buildQuery(params?: GetAdminSessionRequestsParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  const append = (key: string, value: string | number | undefined) => {
    if (value !== undefined && String(value).trim() !== '') {
      searchParams.append(key, String(value));
    }
  };

  append('Status', params.Status);
  append('Type', params.Type);
  append('Filter', params.Filter?.trim());
  append('Sorting', params.Sorting);
  append('SkipCount', params.SkipCount);
  append('MaxResultCount', params.MaxResultCount);

  return searchParams.toString();
}

export async function getAdminSessionRequestById(
  id: string
): Promise<ApiSingleResponse<AdminSessionRequest>> {
  try {
    const response = await getData<AdminSessionRequest>(
      endpoints.adminSessionRequests.details(id)
    );

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load private request details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load private request details',
    };
  }
}

export async function getAdminSessionRequests(
  params?: GetAdminSessionRequestsParams
): Promise<ApiSingleResponse<AdminSessionRequestsListResponse>> {
  try {
    const query = buildQuery(params);
    const endpoint = query
      ? `${endpoints.adminSessionRequests.list}?${query}`
      : endpoints.adminSessionRequests.list;
    const response = await getData<AdminSessionRequestsListResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load private requests',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load private requests',
    };
  }
}

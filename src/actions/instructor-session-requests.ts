'use server';

import { getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  SessionRequestListResponse,
  SessionRequestInstructorResult,
  GetSessionRequestsParams,
} from 'src/types/private-request';

/**
 * Fetch instructor session requests with filters
 * GET /api/v1/instructor/session-requests
 */
export async function getSessionRequestsAction(
  params?: GetSessionRequestsParams
): Promise<ApiSingleResponse<SessionRequestListResponse>> {
  try {
    let endpoint = endpoints.instructorSessionRequests.list;

    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Status) {
        searchParams.append('Status', String(params.Status));
      }
      if (params.Type) {
        searchParams.append('Type', params.Type);
      }
      if (params.Filter?.trim()) {
        searchParams.append('Filter', params.Filter.trim());
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

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    const res = await getData<SessionRequestListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch session requests';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session requests',
    };
  }
}

/**
 * Fetch single session request details
 * GET /api/v1/instructor/session-requests/{id}
 */
export async function getSessionRequestDetailsAction(
  id: string
): Promise<ApiSingleResponse<SessionRequestInstructorResult>> {
  try {
    const res = await getData<SessionRequestInstructorResult>(
      endpoints.instructorSessionRequests.details(id)
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch session request details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session request details',
    };
  }
}

/**
 * Accept session request
 * POST /api/v1/instructor/session-requests/{id}/accept
 */
export async function acceptSessionRequestAction(
  id: string
): Promise<ApiSingleResponse<any>> {
  try {
    const res = await postData<any, Record<string, never>>(
      endpoints.instructorSessionRequests.accept(id),
      {}
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to accept session request';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept session request',
    };
  }
}

/**
 * Reject session request
 * POST /api/v1/instructor/session-requests/{id}/reject
 */
export async function rejectSessionRequestAction(
  id: string,
  reason?: string
): Promise<ApiSingleResponse<any>> {
  try {
    const res = await postData<any, { reason: string }>(
      endpoints.instructorSessionRequests.reject(id),
      { reason: reason || '' }
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to reject session request';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject session request',
    };
  }
}


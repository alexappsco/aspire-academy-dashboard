'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  SessionRequestListResponse,
  SessionRequestInstructorResult,
  GetSessionRequestsParams,
  SessionRequestTransactionResult,
  SessionChapterResult,
  SaveSessionChaptersCommand,
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

/**
 * Fetch session request transactions
 * GET /api/v1/instructor/session-requests/{id}/transactions
 */
export async function getSessionRequestTransactionsAction(
  id: string
): Promise<ApiSingleResponse<SessionRequestTransactionResult[]>> {
  try {
    const res = await getData<SessionRequestTransactionResult[]>(
      endpoints.instructorSessionRequests.transactions(id)
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res
        ? (res as { error: string }).error
        : 'Failed to fetch session request transactions';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch session request transactions',
    };
  }
}

/**
 * Save chapters and curriculum for a session request
 * PUT /api/v1/instructor/session-requests/{id}/chapters
 */
export async function saveSessionRequestChaptersAction(
  id: string,
  payload: SaveSessionChaptersCommand
): Promise<ApiSingleResponse<SessionChapterResult[]>> {
  try {
    const res = await editData<SessionChapterResult[], SaveSessionChaptersCommand>(
      endpoints.instructorSessionRequests.chapters(id),
      'PUT',
      payload
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to save session chapters';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save session chapters',
    };
  }
}

/**
 * Delete a chapter from a session request
 * DELETE /api/v1/instructor/session-requests/{id}/chapters/{chapterId}
 */
export async function deleteSessionRequestChapterAction(
  id: string,
  chapterId: string
): Promise<ApiSingleResponse<void>> {
  try {
    const res = await deleteData<void>(
      endpoints.instructorSessionRequests.deleteChapter(id, chapterId)
    );

    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to delete chapter';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete chapter',
    };
  }
}



'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  InstructorDuesSummaryResponse,
  InstructorDuesListResponse,
  GetInstructorDuesParams,
  InstructorDueDetailsResponse,
} from 'src/types/instructor-payout';
import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

function buildQuery(params?: GetInstructorDuesParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  const append = (key: string, value: string | number | undefined) => {
    if (value !== undefined && String(value).trim() !== '') {
      searchParams.append(key, String(value));
    }
  };

  append('CountryId', params.CountryId);
  append('UniversityId', params.UniversityId);
  append('FromDate', params.FromDate);
  append('ToDate', params.ToDate);
  append('Filter', params.Filter?.trim());
  append('Sorting', params.Sorting);
  append('SkipCount', params.SkipCount);
  append('MaxResultCount', params.MaxResultCount);

  return searchParams.toString();
}

/**
 * Fetch top KPI summary for instructor dues
 * GET /api/v1/admin/instructor-dues/summary
 */
export async function getInstructorDuesSummary(params?: {
  FromDate?: string;
  ToDate?: string;
}): Promise<ApiSingleResponse<InstructorDuesSummaryResponse>> {
  try {
    let endpoint = endpoints.instructorDues.summary;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.FromDate) searchParams.append('FromDate', params.FromDate);
      if (params.ToDate) searchParams.append('ToDate', params.ToDate);
      const query = searchParams.toString();
      if (query) endpoint += `?${query}`;
    }

    const response = await getData<InstructorDuesSummaryResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load instructor dues summary',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load instructor dues summary',
    };
  }
}

/**
 * Fetch paginated & filtered list of instructor dues
 * GET /api/v1/admin/instructor-dues
 */
export async function getInstructorDues(
  params?: GetInstructorDuesParams
): Promise<ApiSingleResponse<InstructorDuesListResponse>> {
  try {
    const query = buildQuery(params);
    const endpoint = query
      ? `${endpoints.instructorDues.list}?${query}`
      : endpoints.instructorDues.list;

    const response = await getData<InstructorDuesListResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load instructor dues list',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load instructor dues list',
    };
  }
}

/**
 * Fetch instructor dues details by instructorId
 * GET /api/v1/admin/instructor-dues/{instructorId}
 */
export async function getInstructorDueDetails(
  instructorId: string
): Promise<ApiSingleResponse<InstructorDueDetailsResponse>> {
  try {
    const response = await getData<InstructorDueDetailsResponse>(
      endpoints.instructorDues.details(instructorId)
    );

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load instructor dues details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load instructor dues details',
    };
  }
}

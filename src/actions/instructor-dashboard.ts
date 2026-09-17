'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  InstructorDashboardDto,
  GetInstructorDashboardParams,
} from 'src/types/instructor-dashboard';

export async function getInstructorDashboardAction(
  params?: GetInstructorDashboardParams
): Promise<{ success: boolean; data?: InstructorDashboardDto; error?: string }> {
  try {
    let endpoint = endpoints.instructorDashboard.get;
    if (params) {
      const searchParams = new URLSearchParams();

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

    const res = await getData<InstructorDashboardDto>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch instructor dashboard';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch instructor dashboard',
    };
  }
}

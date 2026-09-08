'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { DashboardDataResponse } from 'src/types/dashboard';

export async function getDashboardData(): Promise<ApiSingleResponse<DashboardDataResponse>> {
  try {
    const res = await getData<DashboardDataResponse>(endpoints.dashboard.get);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch dashboard data';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
    };
  }
}

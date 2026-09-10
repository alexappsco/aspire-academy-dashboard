'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { ReportsDataResponse } from 'src/types/reports';

export async function getReportsData(): Promise<ApiSingleResponse<ReportsDataResponse>> {
  try {
    const res = await getData<ReportsDataResponse>(endpoints.reports.get);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch reports data';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reports data',
    };
  }
}

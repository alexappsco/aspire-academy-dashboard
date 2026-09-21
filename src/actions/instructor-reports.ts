'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { InstructorReportsDto } from 'src/types/instructor-reports';

export async function getInstructorReports(): Promise<ApiSingleResponse<InstructorReportsDto>> {
  try {
    const res = await getData<InstructorReportsDto>(endpoints.instructorReports.get);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch instructor reports';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch instructor reports',
    };
  }
}
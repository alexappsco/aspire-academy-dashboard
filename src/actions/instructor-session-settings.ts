'use server';

import { getData, editData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  InstructorSessionSettingsDto,
  UpdateInstructorSessionSettingsDto,
} from 'src/types/private-request';

/**
 * Fetch instructor session settings (acceptsLiveSessions, acceptsRecordedSessions, counts)
 * GET /api/v1/instructor/session-settings
 */
export async function getInstructorSessionSettingsAction(): Promise<
  ApiSingleResponse<InstructorSessionSettingsDto>
> {
  try {
    const res = await getData<InstructorSessionSettingsDto>(
      endpoints.instructorSessionSettings.get
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch session settings';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session settings',
    };
  }
}

/**
 * Update instructor session settings
 * PUT /api/v1/instructor/session-settings
 */
export async function updateInstructorSessionSettingsAction(
  data: UpdateInstructorSessionSettingsDto
): Promise<ApiSingleResponse<{ message?: string }>> {
  try {
    const res = await editData<{ message?: string }, UpdateInstructorSessionSettingsDto>(
      endpoints.instructorSessionSettings.update,
      'PUT',
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to update session settings';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update session settings',
    };
  }
}

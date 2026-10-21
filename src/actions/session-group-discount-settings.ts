'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type { SessionGroupDiscountSetting } from 'src/types/session-group-discount-setting';
import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

export async function getSessionGroupDiscountSetting(): Promise<
  ApiSingleResponse<SessionGroupDiscountSetting>
> {
  try {
    const response = await getData<SessionGroupDiscountSetting>(
      endpoints.adminSessionRequests.groupDiscountSetting
    );

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load group discount setting',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load group discount setting',
    };
  }
}

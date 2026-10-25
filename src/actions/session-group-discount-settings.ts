'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  CreateSessionGroupDiscountTierPayload,
  SessionGroupDiscountTier,
  SessionGroupDiscountSetting,
  UpdateSessionGroupDiscountSettingPayload,
} from 'src/types/session-group-discount-setting';
import { editData, getData, postData } from 'src/utils/crud-fetch-api';
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

export async function updateSessionGroupDiscountSetting(
  data: UpdateSessionGroupDiscountSettingPayload
): Promise<ApiSingleResponse<SessionGroupDiscountSetting>> {
  try {
    const response = await editData<
      SessionGroupDiscountSetting,
      UpdateSessionGroupDiscountSettingPayload
    >(endpoints.adminSessionRequests.groupDiscountSetting, 'PUT', data);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to update group discount setting',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update group discount setting',
    };
  }
}

export async function createSessionGroupDiscountTier(
  data: CreateSessionGroupDiscountTierPayload
): Promise<ApiSingleResponse<SessionGroupDiscountTier>> {
  try {
    const response = await postData<
      SessionGroupDiscountTier,
      CreateSessionGroupDiscountTierPayload
    >(endpoints.adminSessionRequests.createGroupDiscountTier, data);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to create group discount tier',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create group discount tier',
    };
  }
}

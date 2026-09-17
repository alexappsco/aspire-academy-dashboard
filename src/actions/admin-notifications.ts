'use server';

import { getData, postData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  AdminNotificationItemDto,
  AdminNotificationListResponse,
  GetAdminNotificationsParams,
} from 'src/types/admin-notification';

export async function getAdminNotificationsAction(
  params?: GetAdminNotificationsParams
): Promise<{ success: boolean; data?: AdminNotificationListResponse; error?: string }> {
  try {
    let endpoint = endpoints.adminNotifications.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (params.Type && params.Type.trim() !== '') {
        searchParams.append('Type', params.Type.trim());
      }

      if (params.UserId && params.UserId.trim() !== '') {
        searchParams.append('UserId', params.UserId.trim());
      }

      if (typeof params.IsBroadcast === 'boolean') {
        searchParams.append('IsBroadcast', String(params.IsBroadcast));
      }

      if (params.Sorting && params.Sorting.trim() !== '') {
        searchParams.append('Sorting', params.Sorting.trim());
      }

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

    const res = await getData<AdminNotificationListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch admin notifications';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin notifications',
    };
  }
}

export async function getAdminNotificationByIdAction(
  id: string
): Promise<{ success: boolean; data?: AdminNotificationItemDto; error?: string }> {
  try {
    const res = await getData<AdminNotificationItemDto>(endpoints.adminNotifications.details(id));

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch notification details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notification details',
    };
  }
}

export async function createAdminNotificationAction(
  formData: FormData
): Promise<{ success: boolean; data?: AdminNotificationItemDto; error?: string }> {
  try {
    const res = await postData<AdminNotificationItemDto, FormData>(
      endpoints.adminNotifications.create,
      formData
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to create notification';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    };
  }
}

export async function deleteAdminNotificationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.adminNotifications.delete(id));

    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to delete notification';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification',
    };
  }
}

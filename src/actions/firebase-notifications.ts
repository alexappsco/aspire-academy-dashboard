'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  RegisterDeviceTokenPayload,
  RemoveDeviceTokenPayload,
} from 'src/types/firebase-notification';
import type {
  UserNotificationsQuery,
  UserNotificationsResponse,
} from 'src/types/firebase-notification';
import { deleteDataWithBody, editData, getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

export async function registerFirebaseDevice(
  data: RegisterDeviceTokenPayload
): Promise<ApiSingleResponse<Record<string, never>> & { status?: string | number }> {
  try {
    const response = await postData<Record<string, never>, RegisterDeviceTokenPayload>(
      endpoints.clientNotifications.registerDevice,
      data
    );

    return response.success
      ? { success: true, data: {}, status: response.status }
      : { success: false, error: response.error, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register Firebase device',
    };
  }
}

export async function getUserNotifications(
  params: UserNotificationsQuery = { SkipCount: 0, MaxResultCount: 50 }
): Promise<ApiSingleResponse<UserNotificationsResponse>> {
  try {
    const searchParams = new URLSearchParams();
    if (typeof params.SkipCount === 'number') {
      searchParams.set('SkipCount', String(params.SkipCount));
    }
    if (typeof params.MaxResultCount === 'number') {
      searchParams.set('MaxResultCount', String(params.MaxResultCount));
    }

    const query = searchParams.toString();
    const endpoint = query
      ? `${endpoints.clientNotifications.list}?${query}`
      : endpoints.clientNotifications.list;
    const response = await getData<UserNotificationsResponse>(endpoint, { cache: 'no-store' });

    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load notifications',
    };
  }
}

export async function getUserNotificationsUnreadCount(): Promise<ApiSingleResponse<number>> {
  try {
    const response = await getData<number>(endpoints.clientNotifications.unreadCount, {
      cache: 'no-store',
    });

    return response.success
      ? { success: true, data: typeof response.data === 'number' ? response.data : 0 }
      : { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load unread notifications count',
    };
  }
}

export async function markUserNotificationAsRead(id: string): Promise<ApiSingleResponse<null>> {
  try {
    const response = await editData<Record<string, never>, Record<string, never>>(
      endpoints.clientNotifications.markAsRead(id),
      'PUT',
      {}
    );
    return response.success
      ? { success: true, data: null }
      : { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    };
  }
}

export async function markAllUserNotificationsAsRead(): Promise<ApiSingleResponse<null>> {
  try {
    const response = await editData<Record<string, never>, Record<string, never>>(
      endpoints.clientNotifications.markAllAsRead,
      'PUT',
      {}
    );
    return response.success
      ? { success: true, data: null }
      : { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
    };
  }
}

export async function unregisterFirebaseDevice(
  data: RemoveDeviceTokenPayload
): Promise<ApiSingleResponse<null>> {
  try {
    const response = await deleteDataWithBody<Record<string, never>, RemoveDeviceTokenPayload>(
      endpoints.clientNotifications.unregisterDevice,
      data
    );
    return response.success
      ? { success: true, data: null }
      : { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unregister Firebase device',
    };
  }
}

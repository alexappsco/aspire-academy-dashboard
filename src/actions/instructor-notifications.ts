'use server';

import { getData, postData, editData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  InstructorNotificationItemDto,
  InstructorNotificationListResponse,
  GetInstructorNotificationsParams,
  SendInstructorNotificationPayload,
} from 'src/types/instructor-notification';

export async function getInstructorNotificationsAction(
  params?: GetInstructorNotificationsParams
): Promise<{ success: boolean; data?: InstructorNotificationListResponse; error?: string }> {
  try {
    let endpoint = endpoints.instructorNotifications.received;
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

    const res = await getData<InstructorNotificationListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch instructor notifications';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch instructor notifications',
    };
  }
}

export async function getInstructorSentNotificationsAction(
  params?: GetInstructorNotificationsParams
): Promise<{ success: boolean; data?: InstructorNotificationListResponse; error?: string }> {
  try {
    let endpoint = endpoints.instructorNotifications.sent;
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

    const res = await getData<InstructorNotificationListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch sent notifications';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sent notifications',
    };
  }
}

export async function getInstructorUnreadCountAction(): Promise<{
  success: boolean;
  data?: number;
  error?: string;
}> {
  try {
    const res = await getData<number>(endpoints.instructorNotifications.unreadCount);

    if ('success' in res && res.success) {
      return { success: true, data: typeof res.data === 'number' ? res.data : 0 };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch unread count';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch unread count',
    };
  }
}

export async function markInstructorNotificationAsReadAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await editData(endpoints.instructorNotifications.markAsRead(id), 'PUT', {});

    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to mark notification as read';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    };
  }
}

export async function markAllInstructorNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await editData(endpoints.instructorNotifications.markAllAsRead, 'PUT', {});

    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to mark all notifications as read';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
    };
  }
}

export async function sendInstructorNotificationAction(
  data: SendInstructorNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await postData<unknown, SendInstructorNotificationPayload>(
      endpoints.instructorNotifications.send,
      data
    );

    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to send notification';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}

export async function getInstructorNotificationDetailsAction(
  id: string
): Promise<{ success: boolean; data?: InstructorNotificationItemDto; error?: string }> {
  try {
    const res = await getData<InstructorNotificationItemDto>(
      endpoints.instructorNotifications.receivedDetails(id)
    );

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

export async function getInstructorSentNotificationDetailsAction(
  id: string
): Promise<{ success: boolean; data?: InstructorNotificationItemDto; error?: string }> {
  try {
    const res = await getData<InstructorNotificationItemDto>(
      endpoints.instructorNotifications.sentDetails(id)
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch sent notification details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sent notification details',
    };
  }
}


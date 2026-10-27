export type DevicePlatform = 'Android' | 'Ios' | 'Web';

export type RegisterDeviceTokenPayload = {
  token: string;
  platform: DevicePlatform;
};

export type FirebaseTokenFailureReason =
  | 'browser_required'
  | 'browser_unsupported'
  | 'messaging_unsupported'
  | 'missing_vapid_key'
  | 'permission_not_granted'
  | 'empty_token'
  | 'token_request_failed';

export type UserNotification = {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  type: 'General' | 'CoursePromo' | 'PurchaseComplete' | string;
  isRead: boolean;
  createdAt: string;
};

export type UserNotificationsResponse = {
  items?: UserNotification[] | null;
  totalCount: number;
};

export type UserNotificationsQuery = {
  SkipCount?: number;
  MaxResultCount?: number;
};

export type DevicePlatform = 'Android' | 'Ios' | 'Web';

export type RegisterDeviceTokenPayload = {
  token: string;
  platform: DevicePlatform;
};

export type RemoveDeviceTokenPayload = {
  token: string;
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
  type: 'General' | 'CoursePromo' | 'PurchaseComplete' | string | number;
  isRead: boolean;
  createdAt: string;
  /** What the notification is about; with referenceId, opens it on click. Null for announcements. */
  referenceType?: NotificationReferenceType | null;
  referenceId?: string | null;
  sessionRequestId?: string | null;
  orderId?: string | null;
  courseId?: string | null;
  walletChargeRequestId?: string | null;
};

export type NotificationReferenceType = 'SessionRequest' | 'Order' | 'Course' | 'WalletChargeRequest';

export type UserNotificationsResponse = {
  items?: UserNotification[] | null;
  totalCount: number;
};

export type UserNotificationsQuery = {
  SkipCount?: number;
  MaxResultCount?: number;
};

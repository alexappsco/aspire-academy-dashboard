export interface AdminNotificationItemDto {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  imageUrl?: string | null;
  type: string | number; // 'General' | 'CoursePromo' | 'PurchaseComplete' | 1 | 2 | 3
  userId?: string | null;
  senderUserId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 'General' | 'CoursePromo' | 'PurchaseComplete';

export function normalizeNotificationType(type: unknown): NotificationType {
  const t = String(type ?? '').trim();
  if (t === '1' || t.toLowerCase() === 'general') return 'General';
  if (t === '2' || t.toLowerCase() === 'coursepromo') return 'CoursePromo';
  if (t === '3' || t.toLowerCase() === 'purchasecomplete') return 'PurchaseComplete';
  return 'General';
}

export interface AdminNotificationListResponse {
  items: AdminNotificationItemDto[];
  totalCount: number;
}

export interface GetAdminNotificationsParams {
  Type?: string;
  UserId?: string;
  IsBroadcast?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateAdminNotificationDto {
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  image?: File | Blob | null;
  type: string; // 'General' | 'CoursePromo' | 'PurchaseComplete'
  userIds?: string[];
  targetRole?: 'Student' | 'Instructor';
}

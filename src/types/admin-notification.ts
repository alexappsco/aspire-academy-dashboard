export interface AdminNotificationItemDto {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  imageUrl?: string | null;
  type: string; // 'General' | 'CoursePromo' | 'PurchaseComplete'
  userId?: string | null;
  senderUserId?: string | null;
  isRead: boolean;
  createdAt: string;
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

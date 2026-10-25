export interface InstructorNotificationItemDto {
  id: string;
  title: string;
  message: string;
  imageUrl?: string | null;
  type: string | number;
  isRead: boolean;
  createdAt: string;
}

export interface InstructorNotificationListResponse {
  items: InstructorNotificationItemDto[];
  totalCount: number;
}

export type InstructorNotificationType = 'General' | 'CoursePromo' | 'PurchaseComplete';

export interface GetInstructorNotificationsParams {
  Type?: string;
  UserId?: string;
  FromDate?: string;
  ToDate?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface SendInstructorNotificationPayload {
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  courseId: string;
}

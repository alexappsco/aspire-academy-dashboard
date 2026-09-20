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

export interface GetInstructorNotificationsParams {
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

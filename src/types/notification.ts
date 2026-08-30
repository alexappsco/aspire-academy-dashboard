export interface AppNotification {
  id: string;
  message: string;
  createdAt: string;
  avatarUrl: string | null;
  isRead: boolean;
}

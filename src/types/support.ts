export type ContactUsMessageStatus = 'new' | 'in_progress' | 'resolved' | string;

export type SenderType = 'student' | 'lecturer' | 'instructor' | string;

export interface ContactUsMessageDto {
  id: string;
  senderName?: string;
  name?: string;
  fullName?: string;
  senderEmail?: string;
  email?: string;
  senderPhone?: string;
  phoneNumber?: string;
  phone?: string;
  senderType?: string;
  userType?: string;
  userId?: string | null;
  userName?: string | null;
  title?: string;
  subject?: string;
  notes?: string;
  message?: string;
  content?: string;
  description?: string;
  details?: string;
  status: ContactUsMessageStatus;
  creationTime?: string;
  createdAt?: string;
  created_at?: string;
  reply?: string | null;
  response?: string | null;
}

export interface ContactUsMessageListResponse {
  totalCount: number;
  items: ContactUsMessageDto[];
}

export interface GetContactUsMessagesParams {
  Status?: string;
  SenderType?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
  Date?: string;
}

export interface UpdateContactUsMessageStatusDto {
  status: string | number;
}

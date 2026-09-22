export type ContactUsMessageStatus = 'New' | 'InProgress' | 'Resolved' | string;

export type SenderType = 'Student' | 'Instructor' | string;

export interface ContactUsMessageDto {
  id: string;
  email: string;
  title: string;
  notes: string;
  name: string;
  userId?: string | null;
  userName?: string | null;
  senderType: SenderType;
  status: ContactUsMessageStatus;
  creationTime: string;

  // Backward-compatible fallback aliases
  senderName?: string;
  senderEmail?: string;
  message?: string;
  createdAt?: string;
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

// ── Instructor Contact Us ──────────────────────────────────

export interface CreateInstructorContactUsDto {
  email: string;
  title: string;
  notes: string;
  name: string;
}

export interface GetInstructorContactUsMessagesParams {
  Status?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

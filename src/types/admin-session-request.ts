export type AdminSessionRequestStatus =
  | 'Pending'
  | 'AwaitingAdminReview'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type AdminSessionRequestType = 'Live' | 'Recorded';

export type AdminSessionRequestParticipant = {
  studentId: string;
  name: string;
  email: string;
  imageUrl: string;
  countryId: string;
  countryName: string;
};

export type AdminSessionRequest = {
  id: string;
  requestNumber?: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  participants: AdminSessionRequestParticipant[];
  type: AdminSessionRequestType | 1 | 2;
  specializationId: string;
  specializationName: string;
  description: string;
  assignedInstructorId: string;
  assignedInstructorName: string;
  status: AdminSessionRequestStatus | 1 | 2 | 3 | 4 | 5 | 6;
  rejectionReason: string;
  respondedAt: string | null;
  platformPercentage: number | null;
  adminReviewedAt: string | null;
  chaptersCount: number;
  lessonsCount: number;
  totalHoursBilled: number;
  creationTime: string;
};

export type AdminSessionRequestsListResponse = {
  items: AdminSessionRequest[];
  totalCount: number;
};

export type GetAdminSessionRequestsParams = {
  Status?: AdminSessionRequestStatus;
  Type?: AdminSessionRequestType;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type AdminSessionRequestStatusCounts = Record<AdminSessionRequestStatus, number> & {
  total: number;
};

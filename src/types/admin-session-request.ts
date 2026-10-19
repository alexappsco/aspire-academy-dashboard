export type AdminSessionRequestStatus =
  | 'Pending'
  | 'AwaitingAdminReview'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type AdminSessionRequestType = 'Live' | 'Recorded';
export type AdminSessionRequestPartyType = 'Individual' | 'Group';

export type AdminSessionRequestParticipant = {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  countryId: string;
  countryName: string;
  walletHoursBalance: number;
};

export type AdminSessionRequest = {
  id: string;
  requestNumber?: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentWalletHoursBalance: number;
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
  PartyType?: AdminSessionRequestPartyType;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type AdminSessionRequestStatusCounts = Record<AdminSessionRequestStatus, number> & {
  total: number;
};

export type SessionGroupDiscountSetting = {
  isEnabled: boolean;
  minParticipants: number;
  discountPercentage: number;
};

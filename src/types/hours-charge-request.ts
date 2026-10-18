export type HoursChargeRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export type HoursChargeRequest = {
  id: string;
  userName: string;
  hours: number;
  countryId: string;
  countryName: string;
  pricePerHour: number;
  totalAmount: number;
  status: HoursChargeRequestStatus | 1 | 2 | 3;
  creationTime: string;
};

export type HoursChargeRequestsListResponse = {
  items: HoursChargeRequest[];
  totalCount: number;
};

export type HoursChargeRequestStatusCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type GetHoursChargeRequestsParams = {
  Status?: HoursChargeRequestStatus;
  CountryId?: string;
  FromDate?: string;
  Filter?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type HoursChargeRequestDetails = {
  id: string;
  requestNumber: string;
  userName: string;
  userEmail: string;
  hours: number;
  countryId: string;
  countryName: string;
  pricePerHour: number;
  totalAmount: number;
  receiptUrl: string;
  status: HoursChargeRequestStatus | 1 | 2 | 3;
  creationTime: string;
};
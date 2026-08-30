export type SupportRequestStatus =
  | "under_review"
  | "in_progress"
  | "resolved"
  | "closed";

export interface SupportRequest {
  id: string;
  requestNumber: string;
  email: string;
  details: string;
  status: SupportRequestStatus;
  createdAt: string;
}

export interface CreateSupportRequestInput {
  email: string;
  details: string;
}

export interface SupportRequestFilters {
  search: string;
  status: SupportRequestStatus | "all";
}

export type SupportPageView = "list" | "create";

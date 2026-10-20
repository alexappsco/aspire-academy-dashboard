import type {
  AdminSessionRequestStatus,
  AdminSessionRequestStatusCounts,
} from 'src/types/admin-session-request';

export const SESSION_REQUEST_STATUSES: AdminSessionRequestStatus[] = [
  'Pending',
  'AwaitingAdminReview',
  'Active',
  'Completed',
  'Rejected',
  'Cancelled',
];

export const EMPTY_COUNTS: AdminSessionRequestStatusCounts = {
  total: 0,
  Pending: 0,
  AwaitingAdminReview: 0,
  Active: 0,
  Completed: 0,
  Rejected: 0,
  Cancelled: 0,
};

export const STATUS_STYLES: Record<
  AdminSessionRequestStatus,
  { backgroundColor: string; color: string }
> = {
  Pending: { backgroundColor: '#E0F2FE', color: '#0369A1' },
  AwaitingAdminReview: { backgroundColor: '#FFF4D6', color: '#C77700' },
  Active: { backgroundColor: '#DCFCE7', color: '#15803D' },
  Completed: { backgroundColor: '#EEF2F6', color: '#64748B' },
  Rejected: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  Cancelled: { backgroundColor: '#F1F5F9', color: '#475569' },
};

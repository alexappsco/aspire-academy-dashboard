import type {
  HoursChargeRequestStatus,
  HoursChargeRequestStatusCounts,
} from 'src/types/hours-charge-request';

export const EMPTY_COUNTS: HoursChargeRequestStatusCounts = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

export const STATUS_STYLES: Record<
  HoursChargeRequestStatus,
  { backgroundColor: string; color: string }
> = {
  Pending: { backgroundColor: '#FFF4D6', color: '#C77700' },
  Approved: { backgroundColor: '#DCFCE7', color: '#15803D' },
  Rejected: { backgroundColor: '#FEE2E2', color: '#DC2626' },
};
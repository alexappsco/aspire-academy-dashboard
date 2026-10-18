import type { HoursChargeRequest, HoursChargeRequestStatus } from 'src/types/hours-charge-request';

export type StatusFilter = 'all' | HoursChargeRequestStatus;

export type HoursChargeRequestRow = HoursChargeRequest & {
  requestNumber: string;
  student: string;
  country: string;
  hoursValue: number;
  hourPrice: number;
  total: number;
  receipt?: string;
  submittedAt: string;
  statusValue: HoursChargeRequestStatus;
};
import type { HoursChargeRequest, HoursChargeRequestStatus } from 'src/types/hours-charge-request';

import type { HoursChargeRequestRow } from './types';

export function formatRequestDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function toRequestRow(request: HoursChargeRequest): HoursChargeRequestRow {
  return {
    ...request,
    requestNumber: request.id,
    student: request.userName,
    country: request.countryName,
    hoursValue: request.hours,
    hourPrice: request.pricePerHour,
    total: request.totalAmount,
    submittedAt: request.creationTime,
    statusValue: request.status,
  };
}

export function normalizeRequestStatus(value: unknown): HoursChargeRequestStatus | null {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (normalized === 'pending' || normalized === '1') return 'Pending';
  if (normalized === 'approved' || normalized === '2') return 'Approved';
  if (normalized === 'rejected' || normalized === '3') return 'Rejected';

  return null;
}

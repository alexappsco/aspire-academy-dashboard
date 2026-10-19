import type {
  AdminSessionRequest,
  AdminSessionRequestStatus,
} from 'src/types/admin-session-request';

import type { AdminSessionRequestRow } from './types';

const STATUS_MAP: Record<string, AdminSessionRequestStatus> = {
  '1': 'Pending',
  '2': 'AwaitingAdminReview',
  '3': 'Active',
  '4': 'Completed',
  '5': 'Rejected',
  '6': 'Cancelled',
  pending: 'Pending',
  awaitingadminreview: 'AwaitingAdminReview',
  active: 'Active',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export function normalizeSessionRequestStatus(value: unknown): AdminSessionRequestStatus | null {
  return STATUS_MAP[String(value).replaceAll('_', '').toLowerCase()] || null;
}

export function formatSessionRequestDate(value: string, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function toSessionRequestRow(request: AdminSessionRequest): AdminSessionRequestRow {
  return {
    ...request,
    requestNumberValue: request.requestNumber || '—',
    studentValue: request.studentName || '—',
    requestKindValue: '',
    participantsValue: '',
    instructorValue: request.assignedInstructorName || '—',
    serviceTypeValue: request.type,
    creationDateValue: request.creationTime,
    statusValue: request.status,
    instructorPercentageValue: '',
  };
}

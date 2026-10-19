import type {
  AdminSessionRequest,
  AdminSessionRequestStatus,
} from 'src/types/admin-session-request';

export type AdminSessionStatusFilter = 'all' | AdminSessionRequestStatus;

export type AdminSessionRequestRow = AdminSessionRequest & {
  requestNumberValue: string;
  studentValue: string;
  requestKindValue: string;
  participantsValue: string;
  instructorValue: string;
  serviceTypeValue: string;
  creationDateValue: string;
  statusValue: AdminSessionRequest['status'];
  instructorPercentageValue: string;
};

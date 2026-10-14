export type PrivateRequestServiceType = 'recorded' | 'live';

export type PrivateRequestStatus = 'new' | 'pending_admin' | 'active' | 'completed' | 'cancelled';

export type PrivateRequestTargetAudience = 'direct' | 'public'; // موجه لك خصيصا / طلب موجه للجميع

export interface StudentAcademicInfo {
  id: string;
  name: string;
  avatar?: string;
  country: string;
  university: string;
  college: string;
  phone?: string;
  email?: string;
}

export interface FinancialTerms {
  countryName: string;
  countryCode: string;
  currencySymbol: string;
  approvedHourPrice: number; // e.g. 10.00
  instructorSharePercent: number; // e.g. 70
  platformSharePercent: number; // e.g. 30
  instructorPerHour: number; // e.g. 7.00
  platformPerHour: number; // e.g. 3.00
}

export interface ActualConsumption {
  actualHours: number; // e.g. 2.25
  filesCount: number; // e.g. 3
  instructorNetEarnings: number; // e.g. 15.75
  totalExecutedValue: number; // e.g. 22.50
  platformRetainedShare: number; // e.g. 6.75
}

export interface FinancialTransaction {
  id: string; // e.g. #TX-9021
  title: string; // e.g. محتوى مسجل 1#
  subtitle?: string; // e.g. Adrenergic Receptors
  date: string; // e.g. 5 أكتوبر 2026 - 03:10 م
  consumedHours: number; // e.g. -0.75
  hourPrice: number; // e.g. 10.00
  totalDeduction: number; // e.g. 7.50
  instructorEarnings: number; // e.g. 5.25 (+70%)
}

export interface LessonAttachment {
  id: string;
  type: 'video' | 'document' | 'quiz';
  title: string;
  fileSize?: string;
  duration?: string;
  quality?: string;
  pagesCount?: number;
  questionsCount?: number;
  passingScore?: number;
  statusText?: string;
  url?: string;
}

export interface RequestLesson {
  id: string;
  number: number;
  title: string;
  statusBadge?: string;
  attachments: LessonAttachment[];
}

export interface RequestChapter {
  id: string;
  number: number;
  title: string;
  isExpanded?: boolean;
  lessons: RequestLesson[];
}

export interface PrivateRequestItem {
  id: string; // e.g. "PR-1050"
  serviceType: PrivateRequestServiceType;
  status: PrivateRequestStatus;
  targetAudience: PrivateRequestTargetAudience;
  student: StudentAcademicInfo;
  description: string;
  createdAt: string; // e.g. "2026-10-06"
  submittedAtFormatted?: string; // e.g. "5 أكتوبر 2026"
  acceptedAtFormatted?: string; // e.g. "5 أكتوبر 2026 - 11:30 ص"
  financialTerms?: FinancialTerms;
  consumption?: ActualConsumption;
  chapters?: RequestChapter[];
  transactions?: FinancialTransaction[];
  // Stats
  totalVideosCount?: number;
  totalDeliveredHours?: number;
  earningHours?: number;
  recordedEarnings?: number;
  liveSessionElapsedMinutes?: number;
  liveSessionDuration?: string; // e.g. "01:30:00"
}

export interface ServiceSettings {
  recorded: {
    isActive: boolean;
    estimatedResponseTime: string;
    activeRequestsCount: number;
  };
  live: {
    isActive: boolean;
    statusLabel: string;
    remainingSessionsCount: number;
    activeSessionId?: string;
  };
}

export interface InstructorSessionSettingsDto {
  acceptsLiveSessions: boolean;
  acceptsRecordedSessions: boolean;
  liveSessionsCount: number;
  recordedSessionsCount: number;
}

export interface UpdateInstructorSessionSettingsDto {
  acceptsLiveSessions: boolean;
  acceptsRecordedSessions: boolean;
}

export enum SessionRequestStatusEnum {
  Pending = 1,
  AwaitingAdminReview = 2,
  Active = 3,
  Completed = 4,
  Rejected = 5,
  Cancelled = 6,
}

export type SessionRequestStatus =
  | 'Pending'
  | 'AwaitingAdminReview'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type SessionType = 'Live' | 'Recorded';

export interface SessionRequestStudentResult {
  studentId: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  countryId?: string | null;
  countryName?: string | null;
}

export interface SessionLessonQuestionChoiceResult {
  id: string;
  title: string;
  order: number;
  isRight: boolean;
}

export interface SessionLessonQuestionResult {
  id: string;
  text: string;
  explanation?: string | null;
  choices: SessionLessonQuestionChoiceResult[];
}

export interface SessionLessonTestResult {
  id: string;
  questions: SessionLessonQuestionResult[];
}

export interface SessionLessonResult {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  durationInSeconds: number;
  videoUrl?: string | null;
  test?: SessionLessonTestResult | null;
  attachmentIds?: string[] | null;
  attachments?: {
    id?: string;
    name?: string;
    url?: string;
    fileName?: string;
    type?: string;
  }[] | null;
  creationTime: string;
}

export interface SessionChapterResult {
  id: string;
  title: string;
  order: number;
  hours: number;
  lessons: SessionLessonResult[];
}

export interface SessionRequestInstructorResult {
  id: string;
  student: SessionRequestStudentResult;
  type: SessionType;
  specializationId?: string;
  specializationName?: string | null;
  description?: string | null;
  isBroadcast: boolean;
  status: SessionRequestStatus;
  rejectionReason?: string | null;
  respondedAt?: string | null;
  platformPercentage?: number | null;
  totalChapterHours?: number | null;
  effectiveHours?: number | null;
  pricePerHour?: number | null;
  effectiveHoursValue?: number | null;
  currencyId?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  chapters?: SessionChapterResult[] | null;
  creationTime: string;
}

export interface SessionRequestListResponse {
  items: SessionRequestInstructorResult[];
  totalCount: number;
}

export interface GetSessionRequestsParams {
  Status?: SessionRequestStatus;
  Type?: SessionType;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface SessionRequestTransactionResult {
  id: string;
  transactionNumber: string;
  sessionChapterId?: string | null;
  chapterTitle?: string | null;
  hours: number;
  pricePerHour: number;
  totalAmount: number;
  instructorHours: number;
  instructorAmount: number;
  currencyId?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  creationTime: string;
}

// Input command interfaces for saving chapters
export interface SaveSessionChoiceInput {
  id?: string | null;
  title?: string | null;
  order: number;
  isRight: boolean;
}

export interface SaveSessionQuestionInput {
  id?: string | null;
  text?: string | null;
  explanation?: string | null;
  choices?: SaveSessionChoiceInput[] | null;
}

export interface SaveSessionTestInput {
  id?: string | null;
  questions?: SaveSessionQuestionInput[] | null;
}

export interface SaveSessionLessonInput {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  order: number;
  durationInSeconds: number;
  videoUrl?: string | null;
  test?: SaveSessionTestInput | null;
  attachmentIds?: string[] | null;
}

export interface SaveSessionChapterInput {
  id?: string | null;
  title?: string | null;
  order: number;
  hours: number;
  lessons?: SaveSessionLessonInput[] | null;
}

export interface SaveSessionChaptersCommand {
  chapters?: SaveSessionChapterInput[] | null;
}



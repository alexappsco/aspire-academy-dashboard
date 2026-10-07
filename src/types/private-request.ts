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


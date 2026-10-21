export type PayoutTransactionStatus = 'completed' | 'pending' | 'under_review' | 'settled';

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  iban: string;
  phone: string;
  email: string;
  lastUpdated: string;
  isComplete: boolean;
}

export interface PayoutTransaction {
  id: string;
  date: string;
  note: string;
  reference: string;
  amount: number;
  currency: string;
  status: PayoutTransactionStatus;
  receiptUrl?: string | null;
  receiptFileName?: string | null;
}

export interface InstructorPayoutItem {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  country: string;
  university: string;
  totalEarnings: number;
  totalTransferred: number;
  dueNow: number;
  underReviewAmount?: number;
  lastTransferDate?: string | null;
  currency: string;
  bankDetails: BankDetails;
  transactions?: PayoutTransaction[];
}

export interface InstructorPayoutsSummary {
  dueNowTotal: number;
  instructorsWaitingCount: number;
  transferredThisMonthTotal: number;
  transfersCountThisMonth: number;
  missingBankDataCount: number;
  currency: string;
}

// ==========================================
// Backend API DTOs (InstructorDuesAdmin)
// ==========================================

export interface InstructorDuesSummaryResponse {
  totalDueNow: number;
  instructorsAwaitingTransferCount: number;
  totalTransferredThisPeriod: number;
  transfersThisPeriodCount: number;
  instructorsWithIncompleteBankDetailsCount: number;
}

export interface InstructorDueItem {
  instructorId: string;
  instructorName: string;
  instructorImageUrl: string | null;
  countryId: string;
  countryName: string;
  universityId: string;
  universityName: string;
  dueNow: number;
  transferredThisPeriod: number;
  transfersThisPeriodCount: number;
  totalProfits: number;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  lastTransferDate: string | null;
  hasCompleteBankDetails: boolean;
}

export interface InstructorDuesListResponse {
  items: InstructorDueItem[];
  totalCount: number;
}

export interface GetInstructorDuesParams {
  CountryId?: string;
  UniversityId?: string;
  FromDate?: string;
  ToDate?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface InstructorDueDetailsResponse {
  instructorId: string;
  instructorName: string;
  instructorTitle?: string;
  instructorImageUrl?: string | null;
  dueNow: number;
  totalProfits: number;
  totalTransferred: number;
  transferredPercent: number;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  iban: string;
  bankName: string;
  bankAccountHolderName: string;
  instructorPhoneNumber: string;
  instructorEmail: string;
  hasCompleteBankDetails?: boolean;
  bankDetailsUpdatedAt?: string | null;
  lastUpdated?: string | null;
}

export interface InstructorTransferItem {
  id: string;
  transferNumber: string;
  amount: number;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  transferDate: string;
  bankReferenceNumber: string;
  receiptUrl?: string | null;
  note?: string | null;
  creationTime: string;
}

export interface InstructorTransfersListResponse {
  items: InstructorTransferItem[];
  totalCount: number;
}

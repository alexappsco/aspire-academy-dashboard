import type {
  InstructorTransferItem,
  InstructorTransfersListResponse,
} from './instructor-payout';

export interface InstructorWalletDetailsResponse {
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
  bankDetailsUpdatedAt?: string | null;
  hasCompleteBankDetails: boolean;
  instructorPhoneNumber: string;
  instructorEmail: string;
}

export interface UpdateInstructorBankDetailsDto {
  iban: string;
  bankName: string;
  bankAccountHolderName: string;
}

/** Backend SessionTypeEnum: Live = 1, Recorded = 2 (may also arrive as string names). */
export type InstructorEarningServiceType = 1 | 2 | 'Live' | 'Recorded' | number | string;
export type InstructorEarningPartyType = 'Individual' | 'Group' | string;

export interface InstructorEarningStudentBreakdown {
  studentId: string;
  studentName: string;
  hoursConsumed: number;
  pricePerHour: number;
  totalValue: number;
  instructorPercentage: number;
  instructorAmount: number;
}

/** SessionRequest = billed session hours; CoursePurchase = a paid order of one of the instructor's courses. */
export type InstructorEarningSource = 'SessionRequest' | 'CoursePurchase';

export interface InstructorEarningItem {
  source?: InstructorEarningSource;
  /** Null for a course purchase. */
  sessionRequestId: string | null;
  /** Set for a course purchase. */
  orderId?: string | null;
  courseId?: string | null;
  courseTitle?: string | null;
  requestNumber: string;
  /** Null for a course purchase. */
  type: InstructorEarningServiceType | null;
  partyType: InstructorEarningPartyType | null;
  studentName: string;
  hoursConsumed: number;
  pricePerHour: number;
  totalValue: number;
  instructorPercentage: number;
  instructorAmount: number;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  studentBreakdown?: InstructorEarningStudentBreakdown[] | null;
  creationTime: string;
}

export interface InstructorEarningsListResponse {
  items: {
    items: InstructorEarningItem[];
    totalCount: number;
  };
  totalConsumedValue: number;
  totalInstructorAmount: number;
}

export type { InstructorTransferItem, InstructorTransfersListResponse };

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

export type { InstructorTransferItem, InstructorTransfersListResponse };

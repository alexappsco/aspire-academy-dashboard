'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  InstructorWalletDetailsResponse,
  InstructorTransfersListResponse,
  InstructorEarningsListResponse,
  UpdateInstructorBankDetailsDto,
} from 'src/types/instructor-wallet';
import { getData, editData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

/**
 * Fetch current instructor's dues and wallet summary
 * GET /api/v1/instructor/dues
 */
export async function getInstructorMyWallet(): Promise<
  ApiSingleResponse<InstructorWalletDetailsResponse>
> {
  try {
    const response = await getData<InstructorWalletDetailsResponse>(
      endpoints.instructorWallet.dues
    );

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load wallet details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load wallet details',
    };
  }
}

/**
 * Fetch current instructor's completed bank transfers log
 * GET /api/v1/instructor/dues/transfers?SkipCount={skip}&MaxResultCount={max}
 */
export async function getInstructorMyTransfers(params?: {
  SkipCount?: number;
  MaxResultCount?: number;
}): Promise<ApiSingleResponse<InstructorTransfersListResponse>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.SkipCount !== undefined) {
      searchParams.append('SkipCount', String(params.SkipCount));
    }
    if (params?.MaxResultCount !== undefined) {
      searchParams.append('MaxResultCount', String(params.MaxResultCount));
    }
    const query = searchParams.toString();
    const baseUrl = endpoints.instructorWallet.transfers;
    const endpoint = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await getData<InstructorTransfersListResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load transfers log',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load transfers log',
    };
  }
}

/**
 * Fetch current instructor's earnings / profit log
 * GET /api/v1/instructor/dues/earnings?SkipCount={skip}&MaxResultCount={max}
 */
export async function getInstructorMyEarnings(params?: {
  SkipCount?: number;
  MaxResultCount?: number;
}): Promise<ApiSingleResponse<InstructorEarningsListResponse>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.SkipCount !== undefined) {
      searchParams.append('SkipCount', String(params.SkipCount));
    }
    if (params?.MaxResultCount !== undefined) {
      searchParams.append('MaxResultCount', String(params.MaxResultCount));
    }
    const query = searchParams.toString();
    const baseUrl = endpoints.instructorWallet.earnings;
    const endpoint = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await getData<InstructorEarningsListResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load earnings log',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load earnings log',
    };
  }
}

/**
 * Update current instructor's bank details
 * PUT /api/v1/instructor/bank-details
 */
export async function updateInstructorBankDetails(
  data: UpdateInstructorBankDetailsDto
): Promise<ApiSingleResponse<UpdateInstructorBankDetailsDto>> {
  try {
    const response = await editData<
      UpdateInstructorBankDetailsDto,
      UpdateInstructorBankDetailsDto
    >(endpoints.instructorWallet.bankDetails, 'PUT', data);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to update bank details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update bank details',
    };
  }
}

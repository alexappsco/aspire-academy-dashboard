'use server';

import type {
  AcademyBankAccount,
  AcademyBankAccountPayload,
} from 'src/types/academy-bank-account';
import type { ApiSingleResponse } from 'src/types/crud-types';
import { deleteData, editData, getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

export async function getAcademyBankAccounts(): Promise<
  ApiSingleResponse<AcademyBankAccount[]>
> {
  try {
    const response = await getData<AcademyBankAccount[]>(endpoints.academyBankAccounts.list);
    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load bank accounts',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load bank accounts',
    };
  }
}

export async function createAcademyBankAccount(
  data: AcademyBankAccountPayload
): Promise<ApiSingleResponse<AcademyBankAccount>> {
  try {
    const response = await postData<AcademyBankAccount, AcademyBankAccountPayload>(
      endpoints.academyBankAccounts.create,
      data
    );
    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to create bank account',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bank account',
    };
  }
}

export async function updateAcademyBankAccount(
  id: string,
  data: AcademyBankAccountPayload
): Promise<ApiSingleResponse<AcademyBankAccount>> {
  try {
    const response = await editData<AcademyBankAccount, AcademyBankAccountPayload>(
      endpoints.academyBankAccounts.update(id),
      'PUT',
      data
    );
    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to update bank account',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update bank account',
    };
  }
}

export async function deleteAcademyBankAccount(
  id: string
): Promise<ApiSingleResponse<Record<string, never>>> {
  try {
    const response = await deleteData<Record<string, never>>(endpoints.academyBankAccounts.delete(id));
    if ('success' in response && response.success) {
      return { success: true, data: {} };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to delete bank account',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bank account',
    };
  }
}

export async function updateAcademyBankAccountVisibility(
  id: string,
  isVisible: boolean
): Promise<ApiSingleResponse<AcademyBankAccount>> {
  try {
    const response = await editData<AcademyBankAccount, undefined>(
      endpoints.academyBankAccounts.visibility(id, isVisible),
      'PUT',
      undefined
    );
    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to update account visibility',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update account visibility',
    };
  }
}

export async function setPrimaryAcademyBankAccount(
  id: string
): Promise<ApiSingleResponse<AcademyBankAccount>> {
  try {
    const response = await postData<AcademyBankAccount, undefined>(
      endpoints.academyBankAccounts.primary(id),
      undefined
    );
    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to set primary bank account',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set primary bank account',
    };
  }
}

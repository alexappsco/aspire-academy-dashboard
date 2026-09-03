'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  CurrencyDto,
  CurrenciesListResponse,
  GetCurrenciesParams,
  CreateCurrencyDto,
  UpdateCurrencyDto,
} from 'src/sections/currencies/types';

export async function getCurrenciesAction(
  params?: GetCurrenciesParams
): Promise<{ success: boolean; data?: CurrenciesListResponse; error?: string }> {
  try {
    let endpoint = endpoints.currencies.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.Sorting) {
        searchParams.append('Sorting', params.Sorting);
      }

      if (typeof params.SkipCount === 'number') {
        searchParams.append('SkipCount', String(params.SkipCount));
      }

      if (typeof params.MaxResultCount === 'number') {
        searchParams.append('MaxResultCount', String(params.MaxResultCount));
      }

      const query = searchParams.toString();
      if (query) {
        endpoint += `?${query}`;
      }
    }

    const res = await getData<CurrenciesListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch currencies';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch currencies',
    };
  }
}

export async function getCurrencyByIdAction(
  id: string
): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
  try {
    const res = await getData<CurrencyDto>(endpoints.currencies.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get currency';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get currency',
    };
  }
}

export async function createCurrencyAction(
  data: CreateCurrencyDto
): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
  try {
    const res = await postData<CurrencyDto, CreateCurrencyDto>(endpoints.currencies.create, data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create currency';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create currency',
    };
  }
}

export async function updateCurrencyAction(
  id: string,
  data: UpdateCurrencyDto
): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
  try {
    const res = await editData<CurrencyDto, UpdateCurrencyDto>(endpoints.currencies.update(id), 'PUT', data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update currency';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update currency',
    };
  }
}

export async function deleteCurrencyAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.currencies.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete currency';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete currency',
    };
  }
}

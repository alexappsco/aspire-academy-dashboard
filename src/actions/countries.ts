'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  CountryDto,
  CountriesListResponse,
  GetCountriesParams,
  CreateCountryDto,
  UpdateCountryDto,
  CurrencyDto,
} from 'src/sections/countries/types';

export async function getCountriesAction(
  params?: GetCountriesParams
): Promise<{ success: boolean; data?: CountriesListResponse; error?: string }> {
  try {
    let endpoint = endpoints.countries.list;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const query = searchParams.toString();
      if (query) {
        endpoint += `?${query}`;
      }
    }

    const res = await getData<CountriesListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch countries';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch countries',
    };
  }
}

export async function getCountryByIdAction(
  id: string
): Promise<{ success: boolean; data?: CountryDto; error?: string }> {
  try {
    const res = await getData<CountryDto>(endpoints.countries.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get country';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get country',
    };
  }
}

export async function createCountryAction(
  data: CreateCountryDto
): Promise<{ success: boolean; data?: CountryDto; error?: string }> {
  try {
    const res = await postData<CountryDto, CreateCountryDto>(endpoints.countries.create, data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create country';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create country',
    };
  }
}

export async function updateCountryAction(
  id: string,
  data: UpdateCountryDto
): Promise<{ success: boolean; data?: CountryDto; error?: string }> {
  try {
    const res = await editData<CountryDto, UpdateCountryDto>(endpoints.countries.update(id), 'PUT', data);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update country';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update country',
    };
  }
}

export async function deleteCountryAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.countries.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete country';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete country',
    };
  }
}

export async function getCurrenciesAction(): Promise<{
  success: boolean;
  data?: CurrencyDto[];
  error?: string;
}> {
  try {
    const res = await getData<CurrencyDto[] | { items: CurrencyDto[] }>(endpoints.currencies.list);
    if ('success' in res && res.success) {
      const data = res.data;
      if (Array.isArray(data)) return { success: true, data };
      if (data && 'items' in data && Array.isArray(data.items)) {
        return { success: true, data: data.items };
      }
      return { success: true, data: [] };
    }
    return { success: true, data: [] };
  } catch {
    return { success: true, data: [] };
  }
}

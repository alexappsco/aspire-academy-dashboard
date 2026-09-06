'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  UniversityDto,
  UniversityListResponse,
  GetUniversitiesParams,
  CreateUniversityDto,
  UpdateUniversityDto,
} from 'src/sections/university/types';

export async function getUniversitiesAction(
  params?: GetUniversitiesParams
): Promise<{ success: boolean; data?: UniversityListResponse; error?: string }> {
  try {
    let endpoint = endpoints.universities.list;
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

    const res = await getData<UniversityListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch universities';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch universities',
    };
  }
}

export async function getUniversityByIdAction(
  id: string
): Promise<{ success: boolean; data?: UniversityDto; error?: string }> {
  try {
    const res = await getData<UniversityDto>(endpoints.universities.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get university';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get university',
    };
  }
}

function buildUniversityFormData(data: CreateUniversityDto): FormData {
  const formData = new FormData();
  formData.append('NameAr', data.nameAr);
  formData.append('NameEn', data.nameEn);
  formData.append('CountryId', data.countryId);
  formData.append('Order', String(data.order));
  formData.append('IsActive', String(data.isActive));
  if (data.image) {
    formData.append('Image', data.image);
  }
  return formData;
}

export async function createUniversityAction(
  data: CreateUniversityDto
): Promise<{ success: boolean; data?: UniversityDto; error?: string }> {
  try {
    const formData = buildUniversityFormData(data);
    const res = await postData<UniversityDto, FormData>(endpoints.universities.create, formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create university';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create university',
    };
  }
}

export async function updateUniversityAction(
  id: string,
  data: UpdateUniversityDto
): Promise<{ success: boolean; data?: UniversityDto; error?: string }> {
  try {
    const formData = buildUniversityFormData(data);
    const res = await editData<UniversityDto, FormData>(endpoints.universities.update(id), 'PUT', formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update university';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update university',
    };
  }
}

export async function deleteUniversityAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData(endpoints.universities.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete university';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete university',
    };
  }
}

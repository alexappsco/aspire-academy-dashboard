'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  Faculty,
  FacultyListResponse,
  GetFacultiesParams,
  CreateFacultyPayload,
  UpdateFacultyPayload,
} from 'src/types/faculty';

// Aliases for backward compatibility
export type FacultyDto = Faculty;
export type FacultiesListResponse = FacultyListResponse;
export type { GetFacultiesParams, CreateFacultyPayload, UpdateFacultyPayload };

function buildFacultyFormData(data: CreateFacultyPayload | UpdateFacultyPayload): FormData {
  const formData = new FormData();
  formData.append('NameAr', data.nameAr);
  formData.append('NameEn', data.nameEn);
  formData.append('UniversityId', data.universityId);
  formData.append('IsActive', String(data.isActive));

  if (data.image) {
    formData.append('Image', data.image);
  }

  if (data.academicYearIds && data.academicYearIds.length > 0) {
    data.academicYearIds.forEach((id) => {
      formData.append('AcademicYearIds', id);
    });
  }

  return formData;
}

export async function getFaculties(
  params?: GetFacultiesParams
): Promise<ApiSingleResponse<FacultyListResponse>> {
  try {
    let endpoint = endpoints.faculties.list;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.IsActive !== undefined) searchParams.append('IsActive', String(params.IsActive));
      if (params.UniversityId) searchParams.append('UniversityId', params.UniversityId);
      if (params.Filter) searchParams.append('Filter', params.Filter);
      if (params.Sorting) searchParams.append('Sorting', params.Sorting);
      if (typeof params.SkipCount === 'number') searchParams.append('SkipCount', String(params.SkipCount));
      if (typeof params.MaxResultCount === 'number') searchParams.append('MaxResultCount', String(params.MaxResultCount));
      const query = searchParams.toString();
      if (query) endpoint += `?${query}`;
    }

    const res = await getData<FacultyListResponse>(endpoint);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch faculties';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch faculties',
    };
  }
}

export async function getFacultyById(
  id: string
): Promise<ApiSingleResponse<Faculty>> {
  try {
    const res = await getData<Faculty>(endpoints.faculties.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get faculty';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get faculty',
    };
  }
}

export async function createFaculty(
  data: FormData | CreateFacultyPayload
): Promise<ApiSingleResponse<Faculty>> {
  try {
    const formData = data instanceof FormData ? data : buildFacultyFormData(data);
    const res = await postData<Faculty, FormData>(endpoints.faculties.create, formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create faculty';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create faculty',
    };
  }
}

export async function updateFaculty(
  id: string,
  data: FormData | UpdateFacultyPayload
): Promise<ApiSingleResponse<Faculty>> {
  try {
    const formData = data instanceof FormData ? data : buildFacultyFormData(data);
    const res = await editData<Faculty, FormData>(endpoints.faculties.update(id), 'PUT', formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update faculty';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update faculty',
    };
  }
}

export async function deleteFaculty(
  id: string
): Promise<ApiSingleResponse<{ success: boolean }>> {
  try {
    const res = await deleteData(endpoints.faculties.delete(id));
    if ('success' in res && res.success) {
      return { success: true, data: { success: true } };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete faculty';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete faculty',
    };
  }
}

'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';

export interface FacultyDto {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  universityId: string;
  university?: { id: string; name: string };
  academicYears: { id: string; name: string }[];
  isActive: boolean;
}

export interface FacultiesListResponse {
  totalCount: number;
  items: FacultyDto[];
}

export interface GetFacultiesParams {
  IsActive?: boolean;
  UniversityId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export async function getFaculties(
  params?: GetFacultiesParams
): Promise<ApiSingleResponse<FacultiesListResponse>> {
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

    const res = await getData<FacultiesListResponse>(endpoint);
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

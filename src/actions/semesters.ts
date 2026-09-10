'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';

export interface SemesterDto {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  academicYears: { id: string; name: string }[];
  isActive: boolean;
}

export interface SemestersListResponse {
  totalCount: number;
  items: SemesterDto[];
}

export interface GetSemestersParams {
  IsActive?: boolean;
  FacultyId?: string;
  AcademicYearId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export async function getSemesters(
  params: GetSemestersParams = {}
): Promise<ApiSingleResponse<SemestersListResponse>> {
  try {
    let endpoint = endpoints.semesters.list;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const qs = query.toString();
    if (qs) endpoint += `?${qs}`;

    const res = await getData<SemestersListResponse>(endpoint);
    if ('success' in res && res.success) {
      return { success: true, data: res.data as SemestersListResponse };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load semesters';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load semesters',
    };
  }
}
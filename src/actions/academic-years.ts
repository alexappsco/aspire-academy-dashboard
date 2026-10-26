'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';

export interface AcademicYearDto {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  faculties: { id: string; name: string }[];
  semesters: { id: string; name: string; order: number }[];
  isActive: boolean;
}

export interface AcademicYearsListResponse {
  totalCount: number;
  items: AcademicYearDto[];
}

export interface GetAcademicYearsParams {
  IsActive?: boolean;
  FacultyId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export async function getAcademicYears(
  params: GetAcademicYearsParams = {}
): Promise<ApiSingleResponse<AcademicYearsListResponse>> {
  try {
    let endpoint = endpoints.academicYear.list;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const qs = query.toString();
    if (qs) endpoint += `?${qs}`;

    const res = await getData<AcademicYearsListResponse>(endpoint);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch academic years';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch academic years',
    };
  }
}


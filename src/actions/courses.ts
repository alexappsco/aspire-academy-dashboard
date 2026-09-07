'use server';

import { getData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { CoursesListResponse, GetCoursesParams, CourseDto } from 'src/types/course';

export async function getCourses(
  params?: GetCoursesParams
): Promise<ApiSingleResponse<CoursesListResponse>> {
  try {
    let endpoint = endpoints.courses.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.SpecializationId && params.SpecializationId.trim() !== '') {
        searchParams.append('SpecializationId', params.SpecializationId.trim());
      }

      if (params.InstructorId && params.InstructorId.trim() !== '') {
        searchParams.append('InstructorId', params.InstructorId.trim());
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

    const res = await getData<CoursesListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch courses';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch courses',
    };
  }
}

export async function getCourseById(id: string): Promise<ApiSingleResponse<CourseDto>> {
  try {
    const res = await getData<CourseDto>(endpoints.courses.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch course details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch course details',
    };
  }
}

export async function deleteCourse(id: string): Promise<ApiSingleResponse<void>> {
  try {
    const res = await deleteData<void>(endpoints.courses.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete course';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete course',
    };
  }
}

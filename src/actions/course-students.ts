'use server';

import { getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  CourseStudentBulkResult,
  CourseStudentListResponse,
  GetCourseStudentsParams,
} from 'src/types/course';

function toQueryString(params?: GetCourseStudentsParams): string {
  if (!params) return '';
  const search = new URLSearchParams();

  if (params.IsActive !== undefined) search.append('IsActive', String(params.IsActive));
  const append = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.append(key, String(value));
    }
  };

  append('Filter', params.Filter);
  append('Sorting', params.Sorting);
  append('SkipCount', params.SkipCount);
  append('MaxResultCount', params.MaxResultCount);

  return search.toString();
}

/** Students enrolled in one course. */
export async function getCourseStudents(
  courseId: string,
  params?: GetCourseStudentsParams
): Promise<ApiSingleResponse<CourseStudentListResponse>> {
  try {
    const base = endpoints.courses.students(courseId);
    const query = toQueryString(params);
    const res = await getData<CourseStudentListResponse>(query ? `${base}?${query}` : base);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load students';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load students',
    };
  }
}

async function bulkSetCourseStudents(
  endpoint: string,
  studentIds: string[],
  fallback: string
): Promise<ApiSingleResponse<CourseStudentBulkResult>> {
  try {
    const res = await postData<CourseStudentBulkResult, { ids: string[] }>(endpoint, {
      ids: studentIds,
    });

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : fallback;
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : fallback,
    };
  }
}

/** Grants course access to one or many students. */
export async function bulkActivateCourseStudents(
  courseId: string,
  studentIds: string[]
): Promise<ApiSingleResponse<CourseStudentBulkResult>> {
  return bulkSetCourseStudents(
    endpoints.courses.studentsBulkActivate(courseId),
    studentIds,
    'Failed to activate students'
  );
}

/** Revokes course access from one or many students. */
export async function bulkDeactivateCourseStudents(
  courseId: string,
  studentIds: string[]
): Promise<ApiSingleResponse<CourseStudentBulkResult>> {
  return bulkSetCourseStudents(
    endpoints.courses.studentsBulkDeactivate(courseId),
    studentIds,
    'Failed to deactivate students'
  );
}

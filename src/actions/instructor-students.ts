'use server';

import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  InstructorStudentListResponse,
  GetInstructorStudentsParams,
  InstructorStudentDetailDto,
  InstructorStudentCourseListResponse,
  GetInstructorStudentCoursesParams,
} from 'src/types/instructor-student';

export async function getInstructorStudentsAction(
  params?: GetInstructorStudentsParams
): Promise<{ success: boolean; data?: InstructorStudentListResponse; error?: string }> {
  try {
    let endpoint = endpoints.instructorStudents.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.CourseId) {
        searchParams.append('CourseId', params.CourseId);
      }

      if (params.Filter) {
        searchParams.append('Filter', params.Filter);
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

    const res = await getData<InstructorStudentListResponse>(endpoint);

    if ('success' in res && res.success && res.data) {
      const items = (res.data.items || []).map((item) => ({
        ...item,
        id: item.id || item.studentId,
      }));
      return { success: true, data: { ...res.data, items } };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch instructor students';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch instructor students',
    };
  }
}

export async function getInstructorStudentDetailsAction(
  studentId: string
): Promise<{ success: boolean; data?: InstructorStudentDetailDto; error?: string }> {
  try {
    const res = await getData<InstructorStudentDetailDto>(
      endpoints.instructorStudents.details(studentId)
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch student details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch student details',
    };
  }
}

export async function getInstructorStudentCoursesAction(
  studentId: string,
  params?: GetInstructorStudentCoursesParams
): Promise<{ success: boolean; data?: InstructorStudentCourseListResponse; error?: string }> {
  try {
    let endpoint = endpoints.instructorStudents.courses(studentId);
    if (params) {
      const searchParams = new URLSearchParams();

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

    const res = await getData<InstructorStudentCourseListResponse>(endpoint);

    if ('success' in res && res.success && res.data) {
      const items = (res.data.items || []).map((item) => ({
        ...item,
        id: item.id || item.courseId,
      }));
      return { success: true, data: { ...res.data, items } };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch student courses';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch student courses',
    };
  }
}

'use server';

import { getData, postData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  StudentItem,
  StudentListResponse,
  GetStudentsParams,
  StudentCourseListResponse,
  GetStudentCoursesParams,
  StudentCourseProgressResponse,
} from 'src/types/student';

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

// ── Students List ──────────────────────────────────────────

export async function getStudents(
  params: GetStudentsParams = {}
): Promise<ApiSingleResponse<StudentListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<StudentListResponse>(`${endpoints.students.list}${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as StudentListResponse };
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

// ── Student Details ────────────────────────────────────────

export async function getStudentById(
  id: string
): Promise<ApiSingleResponse<StudentItem>> {
  try {
    const res = await getData<StudentItem>(endpoints.students.details(id));

    if ('success' in res && res.success) {
      return { success: true, data: res.data as StudentItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load student';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load student',
    };
  }
}

// ── Student Enrolled Courses ───────────────────────────────

export async function getStudentCourses(
  id: string,
  params: GetStudentCoursesParams = {}
): Promise<ApiSingleResponse<StudentCourseListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<StudentCourseListResponse>(`${endpoints.students.courses(id)}${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as StudentCourseListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load student courses';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load student courses',
    };
  }
}

// ── Delete Student ─────────────────────────────────────────

export async function deleteStudent(
  id: string
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await deleteData<null>(endpoints.students.delete(id));

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete student';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete student',
    };
  }
}

// ── Activate Student ───────────────────────────────────────

export async function activateStudent(
  id: string
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await postData<null, undefined>(endpoints.students.activate(id), undefined);

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to activate student';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate student',
    };
  }
}

// ── Deactivate Student ─────────────────────────────────────

export async function deactivateStudent(
  id: string
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await postData<null, undefined>(endpoints.students.deactivate(id), undefined);

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to deactivate student';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate student',
    };
  }
}

// ── Student Course Progress ────────────────────────────────

export async function getStudentCourseProgress(
  id: string,
  courseId: string
): Promise<ApiSingleResponse<StudentCourseProgressResponse>> {
  try {
    const res = await getData<StudentCourseProgressResponse>(
      endpoints.students.courseProgress(id, courseId)
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data as StudentCourseProgressResponse };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load student course progress';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load student course progress',
    };
  }
}


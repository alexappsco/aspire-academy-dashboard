'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  Instructor,
  InstructorListResponse,
  GetInstructorsParams,
  GetUniversitiesParams,
  UniversityListResponse,
  CreateInstructorPayload,
  UpdateInstructorPayload,
} from 'src/types/instructor';

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

// ── Universities (for dropdowns in the instructor form) ────

export async function getUniversities(
  params: GetUniversitiesParams = {}
): Promise<ApiSingleResponse<UniversityListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<UniversityListResponse>(`${endpoints.universities.list}${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as UniversityListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load universities';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load universities',
    };
  }
}

// ── Instructors ────────────────────────────────────────────

export async function getInstructors(
  params: GetInstructorsParams = {}
): Promise<ApiSingleResponse<InstructorListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<InstructorListResponse>(`${endpoints.instructors.list}${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as InstructorListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load instructors';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load instructors',
    };
  }
}

export async function getInstructorById(
  id: string
): Promise<ApiSingleResponse<Instructor>> {
  try {
    const res = await getData<Instructor>(endpoints.instructors.details(id));

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Instructor };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load instructor',
    };
  }
}

export async function createInstructor(
  payload: CreateInstructorPayload
): Promise<ApiSingleResponse<Instructor>> {
  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });

    const res = await postData<Instructor, FormData>(endpoints.instructors.create, formData);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Instructor };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create instructor',
    };
  }
}

export async function updateInstructor(
  id: string,
  payload: UpdateInstructorPayload
): Promise<ApiSingleResponse<Instructor>> {
  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });

    const res = await editData<Instructor, FormData>(
      endpoints.instructors.update(id),
      'PUT',
      formData
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Instructor };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update instructor',
    };
  }
}

export async function deleteInstructor(
  id: string
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await deleteData<null>(endpoints.instructors.delete(id));

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete instructor',
    };
  }
}

export async function verifyInstructor(
  id: string
): Promise<ApiSingleResponse<Instructor>> {
  try {
    const res = await postData<Instructor, undefined>(endpoints.instructors.verify(id), undefined);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Instructor };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to verify instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify instructor',
    };
  }
}

export async function rejectInstructor(
  id: string
): Promise<ApiSingleResponse<Instructor>> {
  try {
    const res = await postData<Instructor, undefined>(endpoints.instructors.reject(id), undefined);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Instructor };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to reject instructor';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject instructor',
    };
  }
}
'use server';

import { getData, editData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  InstructorAssignedStudyMaterial,
  InstructorLookupItem,
  InstructorLookupListResponse,
  InstructorProfileDto,
  UpdateInstructorProfilePayload,
  UpdateInstructorStudyMaterialsPayload,
} from 'src/types/instructor-profile';

function unwrapData<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    'data' in raw &&
    (raw as { data: unknown }).data !== undefined &&
    !('id' in raw)
  ) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function normalizeList<T extends { id: string }>(raw: unknown): T[] {
  const data = unwrapData<unknown>(raw);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

function buildProfileFormData(payload: UpdateInstructorProfilePayload): FormData {
  const formData = new FormData();
  const entries: Record<string, unknown> = { ...payload };

  Object.entries(entries).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          formData.append(key, String(item));
        }
      });
      return;
    }

    formData.append(key, value as string | Blob);
  });

  return formData;
}

export async function getInstructorProfileAction(): Promise<
  ApiSingleResponse<InstructorProfileDto>
> {
  try {
    const res = await getData<InstructorProfileDto | { data: InstructorProfileDto }>(
      endpoints.profile.get
    );

    if ('success' in res && res.success) {
      return { success: true, data: unwrapData<InstructorProfileDto>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load profile';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load profile',
    };
  }
}

export async function updateInstructorProfileAction(
  payload: UpdateInstructorProfilePayload
): Promise<ApiSingleResponse<InstructorProfileDto>> {
  try {
    const formData = buildProfileFormData(payload);
    const res = await editData<InstructorProfileDto | { data: InstructorProfileDto }, FormData>(
      endpoints.profile.update,
      'PUT',
      formData
    );

    if ('success' in res && res.success) {
      return { success: true, data: unwrapData<InstructorProfileDto>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to update profile';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function getInstructorAssignedStudyMaterialsAction(): Promise<
  ApiSingleResponse<InstructorAssignedStudyMaterial[]>
> {
  try {
    const res = await getData<InstructorAssignedStudyMaterial[] | { items: InstructorAssignedStudyMaterial[] }>(
      endpoints.studyMaterialsInstructor.list
    );

    if ('success' in res && res.success) {
      return {
        success: true,
        data: normalizeList<InstructorAssignedStudyMaterial>(res.data),
      };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load study materials';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load study materials',
    };
  }
}

export async function updateInstructorAssignedStudyMaterialsAction(
  payload: UpdateInstructorStudyMaterialsPayload
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await editData<null, UpdateInstructorStudyMaterialsPayload>(
      endpoints.studyMaterialsInstructor.put,
      'PUT',
      payload
    );

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to update study materials';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update study materials',
    };
  }
}

export async function getInstructorProfileCountriesAction(): Promise<
  ApiSingleResponse<InstructorLookupItem[]>
> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.countries
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load countries';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load countries',
    };
  }
}

export async function getInstructorProfileUniversitiesAction(): Promise<
  ApiSingleResponse<InstructorLookupItem[]>
> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.universities
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load universities';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load universities',
    };
  }
}

export async function getInstructorProfileSpecializationsAction(): Promise<
  ApiSingleResponse<InstructorLookupItem[]>
> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.specializations
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load specializations';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load specializations',
    };
  }
}

export async function getInstructorStudyMaterialFacultiesAction(): Promise<
  ApiSingleResponse<InstructorLookupItem[]>
> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.faculties
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load faculties';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load faculties',
    };
  }
}

export async function getInstructorStudyMaterialAcademicYearsAction(
  facultyId: string
): Promise<ApiSingleResponse<InstructorLookupItem[]>> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.academicYears(facultyId)
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load academic years';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load academic years',
    };
  }
}

export async function getInstructorStudyMaterialSemestersAction(
  academicYearId: string
): Promise<ApiSingleResponse<InstructorLookupItem[]>> {
  try {
    const res = await getData<InstructorLookupListResponse | InstructorLookupItem[]>(
      endpoints.studyMaterialsInstructor.semester(academicYearId)
    );

    if ('success' in res && res.success) {
      return { success: true, data: normalizeList<InstructorLookupItem>(res.data) };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load semesters';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load semesters',
    };
  }
}

export async function getInstructorAvailableStudyMaterialsAction(
  semesterId: string
): Promise<ApiSingleResponse<InstructorAssignedStudyMaterial[]>> {
  try {
    const res = await getData<
      InstructorAssignedStudyMaterial[] | { items: InstructorAssignedStudyMaterial[] }
    >(endpoints.studyMaterialsInstructor.available(semesterId));

    if ('success' in res && res.success) {
      return {
        success: true,
        data: normalizeList<InstructorAssignedStudyMaterial>(res.data),
      };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to load available materials';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load available materials',
    };
  }
}

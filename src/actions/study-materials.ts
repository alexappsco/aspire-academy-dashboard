'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type {
  StudyMaterialDto,
  StudyMaterialsListResponse,
  GetStudyMaterialsParams,
  CreateStudyMaterialDto,
  UpdateStudyMaterialDto,
  FacultyLookupDto,
  SemesterLookupDto,
} from 'src/types/study-material';

export async function getStudyMaterialsAction(
  params?: GetStudyMaterialsParams
): Promise<{ success: boolean; data?: StudyMaterialsListResponse; error?: string }> {
  try {
    let endpoint = endpoints.studyMaterials.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.FacultyId && params.FacultyId.trim() !== '') {
        searchParams.append('FacultyId', params.FacultyId.trim());
      }

      if (params.SemesterId && params.SemesterId.trim() !== '') {
        searchParams.append('SemesterId', params.SemesterId.trim());
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

    const res = await getData<StudyMaterialsListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch study materials';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch study materials',
    };
  }
}

export async function getStudyMaterialByIdAction(
  id: string
): Promise<{ success: boolean; data?: StudyMaterialDto; error?: string }> {
  try {
    const res = await getData<StudyMaterialDto>(endpoints.studyMaterials.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch study material details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch study material details',
    };
  }
}

export async function createStudyMaterialAction(
  data: CreateStudyMaterialDto
): Promise<{ success: boolean; data?: StudyMaterialDto; error?: string }> {
  try {
    const res = await postData<StudyMaterialDto, CreateStudyMaterialDto>(
      endpoints.studyMaterials.create,
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create study material';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create study material',
    };
  }
}

export async function updateStudyMaterialAction(
  id: string,
  data: UpdateStudyMaterialDto
): Promise<{ success: boolean; data?: StudyMaterialDto; error?: string }> {
  try {
    const res = await editData<StudyMaterialDto, UpdateStudyMaterialDto>(
      endpoints.studyMaterials.update(id),
      'PUT',
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update study material';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update study material',
    };
  }
}

export async function deleteStudyMaterialAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteData<unknown>(endpoints.studyMaterials.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete study material';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete study material',
    };
  }
}

export async function getFacultiesLookupAction(): Promise<{
  success: boolean;
  data?: FacultyLookupDto[];
  error?: string;
}> {
  try {
    const res = await getData<{ items: FacultyLookupDto[] } | FacultyLookupDto[]>(
      endpoints.faculties.list
    );
    if ('success' in res && res.success && res.data) {
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.items)
        ? res.data.items
        : [];
      return { success: true, data: items };
    }
    return { success: false, error: 'Failed to fetch faculties' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch faculties',
    };
  }
}

export async function getSemestersLookupAction(): Promise<{
  success: boolean;
  data?: SemesterLookupDto[];
  error?: string;
}> {
  try {
    const res = await getData<{ items: SemesterLookupDto[] } | SemesterLookupDto[]>(
      endpoints.semesters.list
    );
    if ('success' in res && res.success && res.data) {
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.items)
        ? res.data.items
        : [];
      return { success: true, data: items };
    }
    return { success: false, error: 'Failed to fetch semesters' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch semesters',
    };
  }
}

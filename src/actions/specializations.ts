'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  Specialization,
  SpecializationListResponse,
  Field,
  FieldListResponse,
} from 'src/types/specialization';

export type GetSpecializationsParams = {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type CreateSpecializationPayload = {
  nameAr: string;
  nameEn: string;
  fieldId: string;
  isActive: boolean;
};

export type UpdateSpecializationPayload = CreateSpecializationPayload;

export type GetFieldsParams = {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

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

// ── Fields ────────────────────────────────────────────────

export async function getFields(
  params: GetFieldsParams = {}
): Promise<ApiSingleResponse<FieldListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<FieldListResponse>(`/admin/fields${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as FieldListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load fields';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load fields',
    };
  }
}

// ── Specializations ───────────────────────────────────────

export async function getSpecializations(
  params: GetSpecializationsParams = {}
): Promise<ApiSingleResponse<SpecializationListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<SpecializationListResponse>(`/admin/specializations${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as SpecializationListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load',
    };
  }
}

export async function getSpecializationById(
  id: string
): Promise<ApiSingleResponse<Specialization>> {
  try {
    const res = await getData<Specialization>(`/admin/specializations/${id}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Specialization };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load',
    };
  }
}

export async function createSpecialization(
  data: CreateSpecializationPayload
): Promise<ApiSingleResponse<Specialization>> {
  try {
    const res = await postData<Specialization, CreateSpecializationPayload>(
      '/admin/specializations',
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Specialization };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create',
    };
  }
}

export async function updateSpecialization(
  id: string,
  data: UpdateSpecializationPayload
): Promise<ApiSingleResponse<Specialization>> {
  try {
    const res = await editData<Specialization, UpdateSpecializationPayload>(
      `/admin/specializations/${id}`,
      'PUT',
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data as Specialization };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update',
    };
  }
}

export async function deleteSpecialization(
  id: string
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await deleteData<null>(`/admin/specializations/${id}`);

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete',
    };
  }
}

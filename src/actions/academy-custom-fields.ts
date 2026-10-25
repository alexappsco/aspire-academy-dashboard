'use server';

import type { AcademyCustomField, AcademyCustomFieldPayload } from 'src/types/academy-custom-field';
import type { ApiSingleResponse } from 'src/types/crud-types';
import { deleteData, editData, getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

export async function getAcademyCustomFields(): Promise<ApiSingleResponse<AcademyCustomField[]>> {
  try {
    const response = await getData<AcademyCustomField[]>(endpoints.academyCustomFields.list);
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load custom fields' };
  }
}

export async function createAcademyCustomField(
  data: AcademyCustomFieldPayload
): Promise<ApiSingleResponse<AcademyCustomField>> {
  try {
    const response = await postData<AcademyCustomField, AcademyCustomFieldPayload>(
      endpoints.academyCustomFields.create,
      data
    );
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create custom field' };
  }
}

export async function updateAcademyCustomField(
  id: string,
  data: AcademyCustomFieldPayload
): Promise<ApiSingleResponse<AcademyCustomField>> {
  try {
    const response = await editData<AcademyCustomField, AcademyCustomFieldPayload>(
      endpoints.academyCustomFields.update(id),
      'PUT',
      data
    );
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update custom field' };
  }
}

export async function deleteAcademyCustomField(
  id: string
): Promise<ApiSingleResponse<Record<string, never>>> {
  try {
    const response = await deleteData<Record<string, never>>(endpoints.academyCustomFields.delete(id));
    return response.success
      ? { success: true, data: {} }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete custom field' };
  }
}

export async function getInstructorCustomFields(): Promise<ApiSingleResponse<AcademyCustomField[]>> {
  try {
    const response = await getData<AcademyCustomField[]>(endpoints.instructorCustomFields.list);
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load custom fields' };
  }
}

export async function createInstructorCustomField(
  data: AcademyCustomFieldPayload
): Promise<ApiSingleResponse<AcademyCustomField>> {
  try {
    const response = await postData<AcademyCustomField, AcademyCustomFieldPayload>(
      endpoints.instructorCustomFields.create,
      data
    );
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create custom field' };
  }
}

export async function updateInstructorCustomField(
  id: string,
  data: AcademyCustomFieldPayload
): Promise<ApiSingleResponse<AcademyCustomField>> {
  try {
    const response = await editData<AcademyCustomField, AcademyCustomFieldPayload>(
      endpoints.instructorCustomFields.update(id),
      'PUT',
      data
    );
    return response.success
      ? { success: true, data: response.data }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update custom field' };
  }
}

export async function deleteInstructorCustomField(
  id: string
): Promise<ApiSingleResponse<Record<string, never>>> {
  try {
    const response = await deleteData<Record<string, never>>(endpoints.instructorCustomFields.delete(id));
    return response.success
      ? { success: true, data: {} }
      : { success: false, error: response.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete custom field' };
  }
}

'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { FaqItem, FaqListResponse, CreateFaqPayload, UpdateFaqPayload } from 'src/types/faq';

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

export async function getFaqs(
  params: { Filter?: string; SkipCount?: number; MaxResultCount?: number } = {}
): Promise<ApiSingleResponse<FaqListResponse>> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const res = await getData<FaqListResponse>(`${endpoints.faqs.list}${qs}`);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as FaqListResponse };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load FAQs';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load FAQs',
    };
  }
}

export async function getFaqById(id: string): Promise<ApiSingleResponse<FaqItem>> {
  try {
    const res = await getData<FaqItem>(endpoints.faqs.details(id));

    if ('success' in res && res.success) {
      return { success: true, data: res.data as FaqItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load FAQ';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load FAQ',
    };
  }
}

export async function createFaq(
  payload: CreateFaqPayload
): Promise<ApiSingleResponse<FaqItem>> {
  try {
    const res = await postData<FaqItem, CreateFaqPayload>(endpoints.faqs.create, payload);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as FaqItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create FAQ';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create FAQ',
    };
  }
}

export async function updateFaq(
  id: string,
  payload: UpdateFaqPayload
): Promise<ApiSingleResponse<FaqItem>> {
  try {
    const res = await editData<FaqItem, UpdateFaqPayload>(endpoints.faqs.update(id), 'PUT', payload);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as FaqItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update FAQ';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update FAQ',
    };
  }
}

export async function deleteFaq(id: string): Promise<ApiSingleResponse<null>> {
  try {
    const res = await deleteData<null>(endpoints.faqs.delete(id));

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete FAQ';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete FAQ',
    };
  }
}
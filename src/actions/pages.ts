'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { PageItem, CreatePagePayload, UpdatePagePayload } from 'src/types/page';

export async function getPages(): Promise<ApiSingleResponse<PageItem[]>> {
  try {
    const res = await getData<PageItem[]>(endpoints.pages.list);

    if ('success' in res && res.success) {
      // Backend may return array directly or wrapped in data
      const pages = (Array.isArray(res.data) ? res.data : (res.data as any)?.items || []) as PageItem[];
      return { success: true, data: pages };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load pages';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pages',
    };
  }
}

export async function getPageBySlug(slug: string): Promise<ApiSingleResponse<PageItem>> {
  try {
    const res = await getData<PageItem>(endpoints.pages.details(slug));

    if ('success' in res && res.success) {
      return { success: true, data: res.data as PageItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load page';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load page',
    };
  }
}

export async function createPage(
  payload: CreatePagePayload
): Promise<ApiSingleResponse<PageItem>> {
  try {
    const res = await postData<PageItem, CreatePagePayload>(endpoints.pages.create, payload);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as PageItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create page';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create page',
    };
  }
}

export async function updatePage(
  slug: string,
  payload: UpdatePagePayload
): Promise<ApiSingleResponse<PageItem>> {
  try {
    const res = await editData<PageItem, UpdatePagePayload>(endpoints.pages.update(slug), 'PUT', payload);

    if ('success' in res && res.success) {
      return { success: true, data: res.data as PageItem };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update page';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update page',
    };
  }
}

export async function deletePage(slug: string): Promise<ApiSingleResponse<null>> {
  try {
    const res = await deleteData<null>(endpoints.pages.delete(slug));

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete page';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete page',
    };
  }
}

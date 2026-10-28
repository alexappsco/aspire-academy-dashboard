'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { SocialItem, CreateSocialPayload, UpdateSocialPayload } from 'src/types/social';

export async function getSocials(): Promise<ApiSingleResponse<SocialItem[]>> {
  try {
    const res = await getData<SocialItem[] | { items: SocialItem[] }>(endpoints.socials.list);

    if ('success' in res && res.success) {
      const items = Array.isArray(res.data)
        ? res.data
        : res.data && Array.isArray((res.data as { items: SocialItem[] }).items)
        ? (res.data as { items: SocialItem[] }).items
        : [];
      return { success: true, data: items };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch social media links';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch social media links',
    };
  }
}

export async function createSocial(
  data: CreateSocialPayload
): Promise<ApiSingleResponse<SocialItem>> {
  try {
    const res = await postData<SocialItem, CreateSocialPayload>(endpoints.socials.create, data);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create social media link';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create social media link',
    };
  }
}

export async function updateSocial(
  id: string,
  data: UpdateSocialPayload
): Promise<ApiSingleResponse<SocialItem>> {
  try {
    const res = await editData<SocialItem, UpdateSocialPayload>(
      endpoints.socials.update(id),
      'PUT',
      data
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update social media link';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update social media link',
    };
  }
}

export async function deleteSocial(id: string): Promise<ApiSingleResponse<boolean>> {
  try {
    const res = await deleteData<unknown>(endpoints.socials.delete(id));

    if ('success' in res && res.success) {
      return { success: true, data: true };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete social media link';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete social media link',
    };
  }
}

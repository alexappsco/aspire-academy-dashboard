"use server";

import { editData, getData } from "src/utils/crud-fetch-api";
import { endpoints } from "src/utils/endpoints";
import type { ApiSingleResponse } from "src/types/crud-types";
import type {
  ContentPage,
  ContentPageSlug,
  UpdateContentPagePayload,
} from "src/types/content-page";

export async function getContentPageAction(
  slug: ContentPageSlug,
): Promise<ApiSingleResponse<ContentPage>> {
  try {
    const response = await getData<ContentPage>(endpoints.pages.details(slug));
    if (response.success) return { success: true, data: response.data };
    return { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch page",
    };
  }
}

export async function updateContentPageAction(
  slug: ContentPageSlug,
  payload: UpdateContentPagePayload,
): Promise<ApiSingleResponse<ContentPage>> {
  try {
    const response = await editData<ContentPage, UpdateContentPagePayload>(
      endpoints.pages.details(slug),
      "PUT",
      payload,
    );
    if (response.success) return { success: true, data: response.data };
    return { success: false, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
    };
  }
}

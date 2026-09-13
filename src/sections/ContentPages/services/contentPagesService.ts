import {
  getContentPageAction,
  updateContentPageAction,
} from "src/actions/content-pages";
import type {
  ContentPage,
  ContentPageSlug,
  UpdateContentPagePayload,
} from "src/types/content-page";

export const contentPagesService = {
  async getPage(slug: ContentPageSlug): Promise<ContentPage> {
    const response = await getContentPageAction(slug);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || "Failed to fetch page");
  },

  async updatePage(
    slug: ContentPageSlug,
    payload: UpdateContentPagePayload,
  ): Promise<ContentPage> {
    const response = await updateContentPageAction(slug, payload);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || "Failed to update page");
  },
};

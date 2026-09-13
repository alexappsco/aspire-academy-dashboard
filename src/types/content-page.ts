export type ContentPageSlug =
  | "about_us"
  | "privacy_policy"
  | "terms_and_conditions";

export type ContentPage = {
  id?: string;
  slug: ContentPageSlug;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  contentAr?: string;
  contentEn?: string;
  content_ar?: string;
  content_en?: string;
};

export type UpdateContentPagePayload = {
  contentAr: string;
  contentEn: string;
};

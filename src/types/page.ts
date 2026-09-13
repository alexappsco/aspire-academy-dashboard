export type PageItem = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  creationTime?: string;
  lastModificationTime?: string | null;
};

export type CreatePagePayload = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

export type UpdatePagePayload = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

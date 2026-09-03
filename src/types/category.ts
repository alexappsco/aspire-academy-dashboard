export type CategoryItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export type FieldsListResponse = {
  totalCount: number;
  items: CategoryItem[];
};

export type CategoryFormValues = {
  nameAr: string;
  nameEn: string;
  order: number;
  isActive: boolean;
  imageFile?: File | null;
};

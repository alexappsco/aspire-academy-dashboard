export type Field = {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export type Specialization = {
  id: string;
  nameAr: string;
  nameEn: string;
  fieldId: string;
  field: { id: string; name: string };
  isActive: boolean;
};

export type SpecializationListResponse = {
  items: Specialization[];
  totalCount: number;
};

export type FieldListResponse = {
  items: Field[];
  totalCount: number;
};

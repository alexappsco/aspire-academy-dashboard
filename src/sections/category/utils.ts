import type { CategoryFormValues } from '../../types/category';

export const FIELDS_ENDPOINT = '/admin/fields';

export function buildFieldsQuery(params: {
  filter?: string;
  isActive?: boolean | null;
  skipCount?: number;
  maxResultCount?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.filter?.trim()) {
    searchParams.set('Filter', params.filter.trim());
  }

  if (params.isActive === true || params.isActive === false) {
    searchParams.set('IsActive', String(params.isActive));
  }

  if (typeof params.skipCount === 'number') {
    searchParams.set('SkipCount', String(params.skipCount));
  }

  if (typeof params.maxResultCount === 'number') {
    searchParams.set('MaxResultCount', String(params.maxResultCount));
  }

  const query = searchParams.toString();
  return query ? `${FIELDS_ENDPOINT}?${query}` : FIELDS_ENDPOINT;
}

export function buildCategoryFormData(values: CategoryFormValues) {
  const formData = new FormData();
  formData.append('NameAr', values.nameAr);
  formData.append('NameEn', values.nameEn);
  formData.append('Order', String(values.order));
  formData.append('IsActive', String(values.isActive));

  if (values.imageFile) {
    formData.append('Image', values.imageFile);
  }

  return formData;
}

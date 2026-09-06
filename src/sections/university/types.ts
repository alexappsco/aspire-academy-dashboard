export type UniversityCountry = {
  id: string;
  name: string;
  code: string | null;
  currencyId: string;
  currency: {
    id: string;
    name: string;
    code: string;
    symbol: string;
  } | null;
};

export type UniversityDto = {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  countryId: string;
  country: UniversityCountry;
  order: number;
  isActive: boolean;
};

export type UniversityListResponse = {
  totalCount: number;
  items: UniversityDto[];
};

export type GetUniversitiesParams = {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type CreateUniversityDto = {
  nameAr: string;
  nameEn: string;
  countryId: string;
  order: number;
  isActive: boolean;
  image?: File | null;
};

export type UpdateUniversityDto = CreateUniversityDto;

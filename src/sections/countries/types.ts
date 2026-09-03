export interface CurrencyDto {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  code: string;
  symbol: string;
  isActive?: boolean;
}

export interface CountryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  code?: string | null;
  currencyId?: string | null;
  currency?: CurrencyDto | null;
  order: number;
  isActive?: boolean;
}

export interface CountriesListResponse {
  totalCount: number;
  items: CountryDto[];
}

export interface GetCountriesParams {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateCountryDto {
  nameAr: string;
  nameEn: string;
  code?: string | null;
  currencyId?: string | null;
  order: number;
  isActive?: boolean;
}

export interface UpdateCountryDto {
  id?: string;
  nameAr: string;
  nameEn: string;
  code?: string | null;
  currencyId?: string | null;
  order: number;
  isActive?: boolean;
}

export interface FormattedCountryRow {
  id: string;
  checkbox?: string;
  order: number;
  name_ar: string;
  name_en: string;
  code: string;
  currency_name: string;
  status: boolean;
  actions?: string;
  raw: CountryDto;
}

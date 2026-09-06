export interface CurrencyDto {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

export interface CurrenciesListResponse {
  totalCount: number;
  items: CurrencyDto[];
}

export interface GetCurrenciesParams {
  Filter?: string;
  IsActive?: boolean;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateCurrencyDto {
  nameAr: string;
  nameEn: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

export interface UpdateCurrencyDto {
  id?: string;
  nameAr: string;
  nameEn: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

export interface FormattedCurrencyRow {
  id: string;
  name_ar: string;
  name_en: string;
  symbol_ar: string;
  symbol_en: string;
  code: string;
  status: boolean;
  raw: CurrencyDto;
}

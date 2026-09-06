import {
  getCountriesAction,
  getCountryByIdAction,
  createCountryAction,
  updateCountryAction,
  deleteCountryAction,
} from 'src/actions/countries';
import { getCurrenciesAction } from 'src/actions/currencies';
import {
  CountryDto,
  CountriesListResponse,
  GetCountriesParams,
  CreateCountryDto,
  UpdateCountryDto,
  CurrencyDto,
} from '../types';

export const countriesService = {
  /**
   * Get list of countries with filtering, sorting, and pagination
   */
  getCountries: async (params?: GetCountriesParams): Promise<CountriesListResponse> => {
    const res = await getCountriesAction(params);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to fetch countries');
  },

  /**
   * Get single country by ID
   */
  getCountryById: async (id: string): Promise<CountryDto> => {
    const res = await getCountryByIdAction(id);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to get country');
  },

  /**
   * Create new country
   */
  createCountry: async (data: CreateCountryDto): Promise<CountryDto> => {
    const res = await createCountryAction(data);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to create country');
  },

  /**
   * Update existing country
   */
  updateCountry: async (id: string, data: UpdateCountryDto): Promise<CountryDto> => {
    const res = await updateCountryAction(id, data);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to update country');
  },

  /**
   * Delete country by ID
   */
  deleteCountry: async (id: string): Promise<void> => {
    const res = await deleteCountryAction(id);
    if (res.success) {
      return;
    }
    throw new Error(res.error || 'Failed to delete country');
  },

  /**
   * Get available currencies list for the currency selector
   */
  getCurrencies: async (): Promise<CurrencyDto[]> => {
    const res = await getCurrenciesAction();
    if (res.success && res.data) {
      if (Array.isArray(res.data.items)) {
        return res.data.items;
      }
    }
    return [];
  },
};

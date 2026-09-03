import {
  getCurrenciesAction,
  getCurrencyByIdAction,
  createCurrencyAction,
  updateCurrencyAction,
  deleteCurrencyAction,
} from 'src/actions/currencies';
import type {
  GetCurrenciesParams,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CurrenciesListResponse,
  CurrencyDto,
} from '../types';

export const currenciesService = {
  async getCurrencies(
    params?: GetCurrenciesParams
  ): Promise<{ success: boolean; data?: CurrenciesListResponse; error?: string }> {
    return getCurrenciesAction(params);
  },

  async getCurrencyById(
    id: string
  ): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
    return getCurrencyByIdAction(id);
  },

  async createCurrency(
    data: CreateCurrencyDto
  ): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
    return createCurrencyAction(data);
  },

  async updateCurrency(
    id: string,
    data: UpdateCurrencyDto
  ): Promise<{ success: boolean; data?: CurrencyDto; error?: string }> {
    return updateCurrencyAction(id, data);
  },

  async deleteCurrency(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    return deleteCurrencyAction(id);
  },
};

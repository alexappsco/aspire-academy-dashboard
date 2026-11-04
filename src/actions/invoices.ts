'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type { GetInvoicesParams, InvoiceItem, InvoiceListResponse } from 'src/types/invoice';
import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

function buildInvoicesQuery(params?: GetInvoicesParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  const append = (key: string, value: string | number | undefined) => {
    if (value !== undefined && String(value).trim() !== '' && String(value) !== 'all') {
      searchParams.append(key, String(value).trim());
    }
  };

  append('Type', params.Type);
  append('FromDate', params.FromDate);
  append('ToDate', params.ToDate);
  append('CurrencyId', params.CurrencyId);
  append('CurrencyCode', params.CurrencyCode);
  append('Filter', params.Filter);
  append('Sorting', params.Sorting);
  if (params.SkipCount !== undefined) searchParams.append('SkipCount', String(params.SkipCount));
  if (params.MaxResultCount !== undefined) searchParams.append('MaxResultCount', String(params.MaxResultCount));

  return searchParams.toString();
}

export async function getInvoicesAction(
  params?: GetInvoicesParams
): Promise<ApiSingleResponse<InvoiceListResponse>> {
  try {
    const query = buildInvoicesQuery(params);
    const endpoint = query
      ? `${endpoints.invoices.list}?${query}`
      : endpoints.invoices.list;

    const response = await getData<InvoiceListResponse>(endpoint);

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load invoices',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load invoices',
    };
  }
}

export async function getInvoiceDetailsAction(
  id: string
): Promise<ApiSingleResponse<InvoiceItem>> {
  try {
    const response = await getData<InvoiceItem>(endpoints.invoices.details(id));

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load invoice details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load invoice details',
    };
  }
}

export async function downloadInvoicePdfAction(
  id: string
): Promise<ApiSingleResponse<{ base64: string; fileName: string }>> {
  try {
    const response = await getData<Blob>(endpoints.invoices.pdf(id));

    if ('success' in response && response.success && response.data) {
      const arrayBuffer = await response.data.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return {
        success: true,
        data: {
          base64,
          fileName: `invoice-${id}.pdf`,
        },
      };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to download invoice PDF',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download invoice PDF',
    };
  }
}

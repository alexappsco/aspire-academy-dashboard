'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type { GetPackagesParams, PackageListResponse } from 'src/types/package';
import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';

export async function getPackages(
  params: GetPackagesParams = {}
): Promise<ApiSingleResponse<PackageListResponse>> {
  try {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    const endpoint = queryString
      ? `${endpoints.packages.list}?${queryString}`
      : endpoints.packages.list;
    const response = await getData<PackageListResponse>(endpoint, { cache: 'no-store' });

    if ('success' in response && response.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: 'error' in response ? response.error : 'Failed to load packages',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load packages',
    };
  }
}

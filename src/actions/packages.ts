'use server';

import type { ApiSingleResponse } from 'src/types/crud-types';
import type { GetPackagesParams, PackageListResponse, PackageSummary } from 'src/types/package';
import { editData, getData, postData } from 'src/utils/crud-fetch-api';
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

export async function getPackageById(id: string): Promise<ApiSingleResponse<PackageSummary>> {
  try {
    const response = await getData<PackageSummary>(endpoints.packages.details(id), {
      cache: 'no-store',
    });
    if ('success' in response && response.success) return { success: true, data: response.data };
    return { success: false, error: 'error' in response ? response.error : 'Failed to load package' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load package' };
  }
}

export async function createPackage(formData: FormData): Promise<ApiSingleResponse<PackageSummary>> {
  try {
    const response = await postData<PackageSummary, FormData>(endpoints.packages.create, formData);
    if ('success' in response && response.success) return { success: true, data: response.data };
    return { success: false, error: 'error' in response ? response.error : 'Failed to create package' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create package' };
  }
}

export async function updatePackage(
  id: string,
  formData: FormData
): Promise<ApiSingleResponse<PackageSummary>> {
  try {
    const response = await editData<PackageSummary, FormData>(
      endpoints.packages.update(id),
      'PUT',
      formData
    );
    if ('success' in response && response.success) return { success: true, data: response.data };
    return { success: false, error: 'error' in response ? response.error : 'Failed to update package' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update package' };
  }
}

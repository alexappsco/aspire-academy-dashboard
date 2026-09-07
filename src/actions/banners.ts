'use server';

import { getData, postData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  BannerDto,
  BannerListResponse,
  GetBannersParams,
  CreateBannerDto,
  UpdateBannerDto,
} from 'src/types/banner';

export async function getBanners(
  params?: GetBannersParams
): Promise<ApiSingleResponse<BannerListResponse>> {
  try {
    let endpoint = endpoints.banners.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (typeof params.IsActive === 'boolean') {
        searchParams.append('IsActive', String(params.IsActive));
      }

      if (params.StartDate) {
        searchParams.append('StartDate', params.StartDate);
      }

      if (params.EndDate) {
        searchParams.append('EndDate', params.EndDate);
      }

      if (params.Sorting) {
        searchParams.append('Sorting', params.Sorting);
      }

      if (typeof params.SkipCount === 'number') {
        searchParams.append('SkipCount', String(params.SkipCount));
      }

      if (typeof params.MaxResultCount === 'number') {
        searchParams.append('MaxResultCount', String(params.MaxResultCount));
      }

      const query = searchParams.toString();
      if (query) {
        endpoint += `?${query}`;
      }
    }

    const res = await getData<BannerListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to fetch banners';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch banners',
    };
  }
}

export async function getBannerById(id: string): Promise<ApiSingleResponse<BannerDto>> {
  try {
    const res = await getData<BannerDto>(endpoints.banners.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to get banner';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get banner',
    };
  }
}

function buildBannerFormData(data: CreateBannerDto | UpdateBannerDto): FormData {
  const formData = new FormData();
  if (data.nameAr !== undefined) formData.append('NameAr', data.nameAr);
  if (data.nameEn !== undefined) formData.append('NameEn', data.nameEn);
  if (data.order !== undefined) formData.append('Order', String(data.order));
  if (data.isActive !== undefined) formData.append('IsActive', String(data.isActive));
  if (data.startAt) formData.append('StartAt', data.startAt);
  if (data.endAt) formData.append('EndAt', data.endAt);
  if (data.courseId) formData.append('CourseId', data.courseId);
  if (data.packageId) formData.append('PackageId', data.packageId);
  if (data.externalUrl) formData.append('ExternalUrl', data.externalUrl);
  if (data.image) {
    formData.append('Image', data.image);
  }
  return formData;
}

export async function createBanner(
  data: CreateBannerDto | FormData
): Promise<ApiSingleResponse<BannerDto>> {
  try {
    const formData = data instanceof FormData ? data : buildBannerFormData(data);
    const res = await postData<BannerDto, FormData>(endpoints.banners.create, formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to create banner';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create banner',
    };
  }
}

export async function updateBanner(
  id: string,
  data: UpdateBannerDto | FormData
): Promise<ApiSingleResponse<BannerDto>> {
  try {
    const formData = data instanceof FormData ? data : buildBannerFormData(data);
    const res = await editData<BannerDto, FormData>(endpoints.banners.update(id), 'PUT', formData);
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to update banner';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update banner',
    };
  }
}

export async function deleteBanner(id: string): Promise<ApiSingleResponse<void>> {
  try {
    const res = await deleteData<void>(endpoints.banners.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to delete banner';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete banner',
    };
  }
}

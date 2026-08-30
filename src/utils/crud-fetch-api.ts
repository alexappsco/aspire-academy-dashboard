'use server';

import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { defaultLocale } from 'src/i18n/config-locale';
import { HOST_API, COOKIES_KEYS } from 'src/config-global';
import { ApiResponse, ApiErrorResponse, RequestOptions } from 'src/types/crud-types';

// Base URL for the API
const API_BASE_URL = HOST_API;

function isFormData(value: unknown) {
  return value instanceof FormData;
}

function isBlobResponse(headers: Headers): boolean {
  const contentType = headers.get('content-type');
  return (
    contentType?.includes('application/pdf') ||
    contentType?.includes('application/octet-stream') ||
    contentType?.includes('image/') ||
    false
  );
}
const commonErrorMessages = new Map([
  ['404', 'not_found'],
  ['500', 'internal_server_error'],
  ['503', 'service_not_available'],
]);
const commonErrorStatus = new Set([500, 503, 404]);
// generic function to make API requests
async function apiRequest<TResponse, TBody = undefined>(
  endpoint: string,
  method: string,
  body?: TBody,
  options: RequestOptions = {}
): Promise<ApiResponse<TResponse>> {
  const t = await getTranslations('Global.Server');
  const url = `${API_BASE_URL}${endpoint}`;
  const cookie = await cookies();

  const token = cookie.get(COOKIES_KEYS.session)?.value;
  const lang = cookie.get(COOKIES_KEYS.lang)?.value || defaultLocale;

  const headers = {
    ...(!isFormData(body) && {
      'Content-Type': 'application/json',
    }),
    ...(!options.skipAuth &&
      token && {
        Authorization: `Bearer ${token}`,
      }),
    'Accept-Language': lang,
    ...options.headers,
  };

  let reqBody;
  if (body) {
    reqBody = isFormData(body) ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: reqBody,
      cache: options.cache,
      next: { tags: options.tags },
    });

    // UN-AUTHORIZED (skip for guest mode)
    if (response.status === 401 && !options.skipAuth) {
      return errorObject(t('unauthorized'), response.status);
    }

    if (commonErrorStatus.has(response.status)) {
      const errMsg = t(commonErrorMessages.get(response.status.toString()) ?? 'unexpected_error');
      return errorObject(errMsg, response.status);
    }

    // Handle blob responses (PDF, images, etc.)
    if (isBlobResponse(response.headers)) {
      const blob = await response.blob();
      return {
        success: true,
        data: blob as unknown as TResponse,
        meta: undefined,
        message: 'Success',
        status: response.status,
      };
    }

    // IF THE RETURN VALUR IS NOTHING BUT A SUCCESS REQUEST (ex: edit/delete requests);
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {
        success: true,
        data: {} as TResponse, // return an empty object or a default value
        meta: undefined,
        message: 'Success',
        status: response.status,
      };
    }

    const responseData = await response.json();

    // Response check after parsing so i can get the error message
    if (!response.ok) {
      const errMsg = Array.isArray(responseData?.message)
        ? responseData?.message.join(' | ')
        : responseData?.message || t;
      const resCode = responseData?.code || null;
      const resDetails = responseData?.details || null;
      const resData = responseData?.data || {};
      const resVErrors = responseData?.validationErrors || null;
      return errorObject(errMsg, response.status, resCode, resDetails, resData, resVErrors);
    }

    return {
      success: true,
      data: responseData,
      meta: responseData.meta,
      message: responseData.message || 'Success',
      status: response.status,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    const errMsg = error instanceof Error ? error.message : t('unexpected_error');
    return errorObject(errMsg, 500);
  }
}

// CRUD functions
export async function getData<TResponse>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse>(endpoint, 'GET', undefined, options);
}


export async function postData<TResponse, TBody>(
  endpoint: string,
  data: TBody,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse, TBody>(endpoint, 'POST', data, options);
}

export async function editData<TResponse, TBody>(
  endpoint: string,
  method: 'PUT' | 'PATCH',
  data: TBody,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse, TBody>(endpoint, method, data, options);
}

export async function deleteData<TResponse>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse>(endpoint, 'DELETE', undefined, options);
}

const errorObject = (
  error: string = '',
  status: string | number = '',
  code: unknown = null,
  details: unknown = null,
  data: unknown = {},
  validationErrors: unknown = null
): ApiErrorResponse => ({
  success: false,
  error,
  status,
  code,
  details,
  data,
  validationErrors,
});

import { HOST_API, COOKIES_KEYS } from 'src/config-global';

export type RequestConfig = RequestInit & {
  data?: unknown;
  url?: string;
  params?: Record<string, unknown>;
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function getLocaleFromCookie(): string {
  const lang = getCookie(COOKIES_KEYS.lang);
  return lang || 'ar';
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    getCookie(COOKIES_KEYS.session) ||
    getCookie('accessToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem(COOKIES_KEYS.session)
  );
}

async function request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
  const { data, headers, params, ...rest } = config;

  let fullUrl = url.startsWith('http')
    ? url
    : `${HOST_API}${url.startsWith('/') ? '' : '/'}${url}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const reqHeaders: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    'Accept-Language': getLocaleFromCookie(),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(headers as Record<string, string>),
  };

  const body = data === undefined ? rest.body : isFormData ? (data as FormData) : JSON.stringify(data);

  const response = await fetch(fullUrl, {
    ...rest,
    headers: reqHeaders,
    body,
  });

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const status = response.status || 500;
    const message = getErrorMessage(responseData);

    if (status === 403 && (message === 'message.permission_denied' || responseData?.message === 'message.permission_denied')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permission_denied'));
      }
    }

    return Promise.reject({ message, status, data: responseData });
  }

  return responseData as T;
}

const axiosInstance = {
  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'DELETE' }),
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'GET' }),
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: 'PATCH' }),
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: 'POST' }),
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: 'PUT' }),
};

export default axiosInstance;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (errObj.error && typeof errObj.error === 'object') {
      const nested = errObj.error as Record<string, unknown>;
      if (nested.message) return String(nested.message);
      if (nested.details) return String(nested.details);
    }
    if (errObj.message) {
      if (Array.isArray(errObj.message)) return errObj.message.join(' | ');
      return String(errObj.message);
    }
    if (errObj.error && typeof errObj.error === 'string') {
      return errObj.error;
    }
    if (errObj.title && typeof errObj.title === 'string') {
      return errObj.title;
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Something went wrong';
};

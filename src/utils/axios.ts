import { HOST_API, COOKIES_KEYS } from 'src/config-global';

type RequestConfig = RequestInit & {
  data?: unknown;
  url?: string;
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

async function request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
  const { data, headers, ...rest } = config;

  const response = await fetch(`${HOST_API}${url}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getLocaleFromCookie(),
      ...headers,
    },
    body: data === undefined ? rest.body : JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const status = response.status || 500;
    const message = getErrorMessage(responseData);

    if (status === 403 && (message === 'message.permission_denied' || responseData?.message === 'message.permission_denied')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permission_denied'));
      }
    }

    return Promise.reject({ message, status });
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

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Something went wrong';
};

import { HOST_API } from 'src/config-global';

type RequestConfig = RequestInit & {
  data?: unknown;
  url?: string;
};

async function request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
  const { data, headers, ...rest } = config;

  const response = await fetch(`${HOST_API}${url}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
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

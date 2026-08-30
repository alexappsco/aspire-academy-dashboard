export type ApiSuccessResponse<TResponse> = {
  data: TResponse;
  message: string;
  meta?: unknown;
  status: number;
  success: true;
};

export type ApiErrorResponse = {
  code?: unknown;
  data?: unknown;
  details?: unknown;
  error: string;
  status: number | string;
  success: false;
  validationErrors?: unknown;
};

export type ApiResponse<TResponse> = ApiSuccessResponse<TResponse> | ApiErrorResponse;

export type RequestOptions = {
  cache?: RequestCache;
  headers?: HeadersInit;
  skipAuth?: boolean;
  tags?: string[];
};

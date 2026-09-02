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

// ── Auth types ──────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpireAt: string;
  refreshTokenExpireAt: string;
  completeTeacherProfile: boolean;
  adminAcepptedTeacherProfile: boolean;
};

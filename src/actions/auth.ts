'use server';

import { postData } from 'src/utils/crud-fetch-api';
import type { ApiResponse } from 'src/types/crud-types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResult = {
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

export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResult>> {
  return postData<LoginResult, LoginPayload>('/api/v1/admin/auth/login', payload, {
    skipAuth: true,
  });
}

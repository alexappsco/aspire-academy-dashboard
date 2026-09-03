'use server';

import { postData } from 'src/utils/crud-fetch-api';
import type { ApiSingleResponse, LoginResponse } from 'src/types/crud-types';

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAction(
  data: LoginPayload
): Promise<ApiSingleResponse<LoginResponse>> {
  try {
    const res = await postData<LoginResponse, LoginPayload>(
      '/admin/auth/login',
      data,
      { skipAuth: true }
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data as LoginResponse };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Login failed';
    return { success: false, error: errorMsg };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

'use server';

import { postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse, LoginResponse } from 'src/types/crud-types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgetPasswordPayload = {
  email: string;
};

export type ForgetPasswordResponse = {
  expiryTimeByMinute: string;
};

export type VerifyForgetPasswordOtpPayload = {
  email: string;
  otp: string;
};

export type VerifyForgetPasswordOtpResponse = {
  token: string;
};

export type ResetPasswordPayload = {
  token: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
};

export async function forgetPasswordAction(
  data: ForgetPasswordPayload
): Promise<ApiSingleResponse<ForgetPasswordResponse>> {
  try {
    const res = await postData<ForgetPasswordResponse, ForgetPasswordPayload>(
      endpoints.auth.forgetPassword,
      data,
      { skipAuth: true }
    );

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Request failed';
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
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export async function verifyForgetPasswordOtpAction(
  data: VerifyForgetPasswordOtpPayload
): Promise<ApiSingleResponse<VerifyForgetPasswordOtpResponse>> {
  try {
    const res = await postData<
      VerifyForgetPasswordOtpResponse,
      VerifyForgetPasswordOtpPayload
    >(endpoints.auth.verifyOtp, data, { skipAuth: true });

    if ('success' in res && res.success && res.data?.token) {
      return { success: true, data: res.data };
    }

    if ('success' in res && res.success && !res.data?.token) {
      return { success: false, error: 'Token not found in response' };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Request failed';
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
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export async function resetPasswordAction(
  data: ResetPasswordPayload
): Promise<ApiSingleResponse<null>> {
  try {
    const res = await postData<null, ResetPasswordPayload>(
      endpoints.auth.resetPassword,
      data,
      { skipAuth: true }
    );

    if ('success' in res && res.success) {
      return { success: true, data: null };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Request failed';
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
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export async function loginAction(
  data: LoginPayload
): Promise<ApiSingleResponse<LoginResponse>> {
  try {
    const res = await postData<LoginResponse, LoginPayload>(
      endpoints.auth.login,
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

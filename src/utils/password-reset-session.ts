const EMAIL_KEY = 'aspire_forgot_password_email';
const TOKEN_KEY = 'aspire_reset_password_token';

export function saveForgotPasswordEmail(email: string) {
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function readForgotPasswordEmail() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(EMAIL_KEY) ?? '';
}

export function saveResetPasswordToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function readResetPasswordToken() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(TOKEN_KEY) ?? '';
}

export function clearPasswordResetSession() {
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

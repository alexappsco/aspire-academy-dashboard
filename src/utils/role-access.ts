import 'server-only';

import { cookies } from 'next/headers';

import { COOKIES_KEYS } from 'src/config-global';
import type { LocaleType } from 'src/i18n/config-locale';
import { redirect } from 'src/i18n/routing';

export type DashboardRole = 'admin' | 'instructor' | 'unknown';

export async function getDashboardRole(): Promise<DashboardRole> {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';

  if (role === 'admin') return 'admin';
  if (role === 'instructor') return 'instructor';
  return 'unknown';
}

export async function requireAdminRole(locale: string, instructorFallback = '/') {
  const role = await getDashboardRole();
  if (role === 'admin') return;

  redirect({
    href: role === 'instructor' ? instructorFallback : '/',
    locale: locale as LocaleType,
  });
}

export async function requireInstructorRole(locale: string, adminFallback = '/') {
  const role = await getDashboardRole();
  if (role === 'instructor') return;

  redirect({
    href: role === 'admin' ? adminFallback : '/',
    locale: locale as LocaleType,
  });
}

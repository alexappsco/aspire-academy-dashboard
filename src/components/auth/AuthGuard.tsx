"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "src/i18n/routing";
import { COOKIES_KEYS, PATH_AFTER_LOGIN } from "src/config-global";

const LOGIN_PATH = `/auth/login`;

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const name = COOKIES_KEYS.session;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Guards protected dashboard routes.
 * Redirects unauthenticated users to the login page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) {
      router.replace(LOGIN_PATH);
    } else {
      queueMicrotask(() => {
        setChecked(true);
      });
    }
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}

/**
 * Guards guest-only routes (login, register, forgot-password).
 * Redirects authenticated users to the home page.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getTokenFromCookie();
    if (token) {
      router.replace(PATH_AFTER_LOGIN);
    } else {
      queueMicrotask(() => {
        setChecked(true);
      });
    }
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
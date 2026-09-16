"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { LoginResponse } from "src/types/crud-types";
import { COOKIES_KEYS } from "src/config-global";

export type AuthUser = Omit<LoginResponse, "accessToken" | "refreshToken" | "accessTokenExpireAt" | "refreshTokenExpireAt">;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string | null;
  isAdmin: boolean;
  isInstructor: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  role: null,
  isAdmin: false,
  isInstructor: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY_USER = COOKIES_KEYS.user;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function getInitialUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) return JSON.parse(saved) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);

  const login = useCallback((data: LoginResponse) => {
    const { accessToken, refreshToken, accessTokenExpireAt, refreshTokenExpireAt, ...userData } = data;

    // Store tokens and user in cookies (server-side reads from cookies)
    setCookie(COOKIES_KEYS.session, accessToken, 10);
    setCookie("refreshToken", refreshToken, 10);
    setCookie(COOKIES_KEYS.user, JSON.stringify(userData), 10);
    setCookie(COOKIES_KEYS.role, userData.role || "", 10);

    // Store user in localStorage
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));

    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeCookie(COOKIES_KEYS.session);
    removeCookie("refreshToken");
    removeCookie(COOKIES_KEYS.user);
    removeCookie(COOKIES_KEYS.role);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  }, []);

  const role = user?.role ?? null;
  const normalizedRole = role ? role.toLowerCase() : "";
  const isAdmin = normalizedRole === "admin";
  const isInstructor = normalizedRole === "instructor";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role,
        isAdmin,
        isInstructor,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

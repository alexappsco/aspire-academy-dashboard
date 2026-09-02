"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { LoginResponse } from "src/types/crud-types";
import { COOKIES_KEYS } from "src/config-global";

type User = Omit<LoginResponse, "accessToken" | "refreshToken" | "accessTokenExpireAt" | "refreshTokenExpireAt">;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
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

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) return JSON.parse(saved) as User;
  } catch {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = useCallback((data: LoginResponse) => {
    const { accessToken, refreshToken, accessTokenExpireAt, refreshTokenExpireAt, ...userData } = data;

    // Store tokens in cookies (server-side reads accessToken from cookies)
    setCookie(COOKIES_KEYS.session, accessToken, 10);
    setCookie("refreshToken", refreshToken, 10);

    // Store user in localStorage
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));

    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeCookie(COOKIES_KEYS.session);
    removeCookie("refreshToken");
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

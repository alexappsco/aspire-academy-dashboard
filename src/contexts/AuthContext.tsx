"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "buyer" | "supplier" | null;

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
});

const STORAGE_KEY = "user_role";

function getInitialRole(): UserRole {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "buyer" || saved === "supplier") return saved;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(STORAGE_KEY, newRole);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

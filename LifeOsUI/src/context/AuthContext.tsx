import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lifeos_token'));
  const [user, setUser]   = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('lifeos_user') || 'null'); }
    catch { return null; }
  });

  const login = useCallback((t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('lifeos_token', t);
    localStorage.setItem('lifeos_user', JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

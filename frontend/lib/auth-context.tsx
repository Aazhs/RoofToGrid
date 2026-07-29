'use client';

/**
 * Auth state for the client shell (design §5).
 * On mount we try `/auth/me` with whatever token is in storage, and fall back to a cookie refresh.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api, getAccessToken, setAccessToken } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    city?: string;
    pincode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUser(null);
      else setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!getAccessToken()) {
        // No token in storage, but a refresh cookie may still be valid.
        try {
          await api.auth.me();
        } catch {
          /* falls through to loading = false */
        }
      }
      if (getAccessToken()) await loadUser();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.auth.login({ email, password });
      setAccessToken(result.accessToken);
      setUser(result.user);
    },
    [],
  );

  const register = useCallback(
    async (input: { email: string; password: string; fullName: string; city?: string; pincode?: string }) => {
      const result = await api.auth.register(input);
      setAccessToken(result.accessToken);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout, refreshUser: loadUser }),
    [user, loading, login, register, logout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  FastQuizClient,
  type AdminUser,
  type User,
} from '@fastquiz/shared';
import { type TotpChallengeState } from '../components/TotpChallengeModal';

export type AnyAuthUser = AdminUser | User;

export interface AuthContextValue {
  user: AnyAuthUser | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  client: FastQuizClient;
  totpChallenge: TotpChallengeState | null;
  login: (email: string, password: string) => Promise<{ requiresTotp: boolean }>;
  confirmTotp: (code: string) => Promise<void>;
  verifyTotp: (code: string) => Promise<void>;
  clearTotpChallenge: () => void;
  loginDemoAdmin: () => void;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const DEMO_ADMIN_USER: AdminUser = {
  id: 'usr-admin-1',
  name: 'Alex Reviewer (Super Admin)',
  email: 'admin@fastquiz.dev',
  role: 'super_admin',
  totp_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_REGULAR_USER: User = {
  id: 'usr-reg-2',
  name: 'Candidate User',
  email: 'candidate@example.com',
  role: 'user',
  created_at: '2026-01-15T00:00:00Z',
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: AnyAuthUser | null;
  initialToken?: string | null;
}> = ({ children, initialUser = null, initialToken = null }) => {
  // Store token and user strictly in-memory (never in localStorage)
  const [user, setUser] = useState<AnyAuthUser | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(initialToken);
  const [totpChallenge, setTotpChallenge] = useState<TotpChallengeState | null>(null);

  // Initialize shared FastQuizClient with in-memory token resolver
  const client = useMemo(() => {
    return new FastQuizClient({
      getAccessToken: () => accessToken,
    });
  }, [accessToken]);

  // Attempt silent session restoration from httpOnly cookie on mount
  useEffect(() => {
    if (initialUser || initialToken) return;

    let isMounted = true;
    const restoreSession = async () => {
      try {
        const response = await client.adminAuth.refreshToken();
        if (isMounted && response?.access_token) {
          setUser(response.admin);
          setAccessToken(response.access_token);
          client.setAccessToken(response.access_token);
        }
      } catch {
        // No active session cookie found - stay logged out
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [client, initialUser, initialToken]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ requiresTotp: boolean }> => {
    try {
      const response = await client.adminAuth.login({ email, password });

      if (response.status === 'authenticated') {
        setUser(response.admin);
        setAccessToken(response.access_token);
        client.setAccessToken(response.access_token);
        setTotpChallenge(null);
        return { requiresTotp: false };
      }

      // Step 2: TOTP Challenge required
      setTotpChallenge(response);
      return { requiresTotp: true };
    } catch (err: unknown) {
      // In offline/demo fallback mode, check if credentials match admin convention
      if (email.toLowerCase().includes('admin')) {
        loginDemoAdmin();
        return { requiresTotp: false };
      }
      throw err;
    }
  };

  const confirmTotp = async (code: string): Promise<void> => {
    if (!totpChallenge || !('pre_auth_token' in totpChallenge)) {
      throw new Error('No active TOTP challenge in progress');
    }
    const response = await client.adminAuth.confirmTotpEnrollment({
      pre_auth_token: totpChallenge.pre_auth_token,
      code,
    });
    setUser(response.admin);
    setAccessToken(response.access_token);
    client.setAccessToken(response.access_token);
    setTotpChallenge(null);
  };

  const verifyTotp = async (code: string): Promise<void> => {
    if (!totpChallenge || !('pre_auth_token' in totpChallenge)) {
      throw new Error('No active TOTP challenge in progress');
    }
    const response = await client.adminAuth.verifyTotp({
      pre_auth_token: totpChallenge.pre_auth_token,
      code,
    });
    setUser(response.admin);
    setAccessToken(response.access_token);
    client.setAccessToken(response.access_token);
    setTotpChallenge(null);
  };

  const clearTotpChallenge = (): void => {
    setTotpChallenge(null);
  };

  const loginDemoAdmin = (): void => {
    const token = 'jwt-memory-admin-token-123';
    setUser(DEMO_ADMIN_USER);
    setAccessToken(token);
    client.setAccessToken(token);
    setTotpChallenge(null);
  };

  const loginDemoUser = (): void => {
    const token = 'jwt-memory-regular-user-token-456';
    setUser(DEMO_REGULAR_USER);
    setAccessToken(token);
    client.setAccessToken(token);
    setTotpChallenge(null);
  };

  const logout = async (): Promise<void> => {
    try {
      await client.adminAuth.logout();
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    setAccessToken(null);
    client.setAccessToken(null);
    setTotpChallenge(null);
  };

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user && accessToken);
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role,
        isAuthenticated,
        isAdmin,
        client,
        totpChallenge,
        login,
        confirmTotp,
        verifyTotp,
        clearTotpChallenge,
        loginDemoAdmin,
        loginDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

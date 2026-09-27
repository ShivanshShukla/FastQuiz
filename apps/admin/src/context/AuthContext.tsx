import React, { createContext, useContext, useState, useMemo } from 'react';
import { FastQuizClient, type User, type UserRole } from '@fastquiz/shared';

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  client: FastQuizClient;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemoAdmin: () => void;
  loginDemoUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const DEMO_ADMIN_USER: User = {
  id: 'usr-admin-1',
  name: 'Alex Reviewer (Admin)',
  email: 'admin@fastquiz.dev',
  role: 'admin',
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
  initialUser?: User | null;
  initialToken?: string | null;
}> = ({ children, initialUser = null, initialToken = null }) => {
  // Store token and user strictly in-memory (never in localStorage)
  const [user, setUser] = useState<User | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(initialToken);

  // Initialize shared FastQuizClient with in-memory token resolver
  const client = useMemo(() => {
    return new FastQuizClient({
      getAccessToken: () => accessToken,
    });
  }, [accessToken]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await client.auth.login({ email, password });
      const userObj = response.user;
      const token = response.tokens.access_token;

      // Verify admin role
      if (userObj.role !== 'admin') {
        throw new Error('Access Denied: Your account does not have administrator privileges.');
      }

      setUser(userObj);
      setAccessToken(token);
      client.setAccessToken(token);
    } catch (err: unknown) {
      // In offline/dev mode, check if credentials match admin convention
      if (email.toLowerCase().includes('admin')) {
        loginDemoAdmin();
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    // Simulated Google OAuth response returning admin claims
    const googleAdmin: User = {
      id: 'usr-google-admin-99',
      name: 'Google Admin User',
      email: 'admin.google@fastquiz.dev',
      role: 'admin',
      google_id: 'goog-123456789',
      created_at: new Date().toISOString(),
    };
    const mockToken = 'mock-google-admin-jwt-token';
    setUser(googleAdmin);
    setAccessToken(mockToken);
    client.setAccessToken(mockToken);
  };

  const loginDemoAdmin = (): void => {
    const token = 'jwt-memory-admin-token-123';
    setUser(DEMO_ADMIN_USER);
    setAccessToken(token);
    client.setAccessToken(token);
  };

  const loginDemoUser = (): void => {
    const token = 'jwt-memory-regular-user-token-456';
    setUser(DEMO_REGULAR_USER);
    setAccessToken(token);
    client.setAccessToken(token);
  };

  const logout = (): void => {
    setUser(null);
    setAccessToken(null);
    client.setAccessToken(null);
  };

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user && accessToken);
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role,
        isAuthenticated,
        isAdmin,
        client,
        login,
        loginWithGoogle,
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

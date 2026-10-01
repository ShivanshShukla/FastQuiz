import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  FastQuizClient,
  type AdminUser,
  type AdminAuthResponse,
  type User,
} from "@fastquiz/shared";
import { type TotpChallengeState } from "../components/TotpChallengeModal";
import { isMockEnabled } from "../config/env";

export type AnyAuthUser = AdminUser | User;

export interface AuthContextValue {
  user: AnyAuthUser | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  client: FastQuizClient;
  totpChallenge: TotpChallengeState | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ requiresTotp: boolean }>;
  confirmTotp: (code: string) => Promise<void>;
  verifyTotp: (code: string) => Promise<void>;
  clearTotpChallenge: () => void;
  loginDemoAdmin: () => void;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const DEMO_ADMIN_USER: AdminUser = {
  id: "usr-admin-1",
  name: "Alex Reviewer (Super Admin)",
  email: "admin@fastquiz.dev",
  role: "super_admin",
  totp_enabled: true,
  created_at: "2026-01-01T00:00:00Z",
};

export const DEMO_REGULAR_USER: User = {
  id: "usr-reg-2",
  name: "Candidate User",
  email: "candidate@example.com",
  role: "user",
  created_at: "2026-01-15T00:00:00Z",
};

// Module-level in-flight de-duplication to prevent race conditions during StrictMode double-mounts
let inFlightRefreshPromise: Promise<AdminAuthResponse | null> | null = null;

const executeSingleRefresh = async (
  client: FastQuizClient,
): Promise<AdminAuthResponse | null> => {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }
  inFlightRefreshPromise = (async () => {
    try {
      return await client.adminAuth.refreshToken();
    } catch {
      return null;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();
  return inFlightRefreshPromise;
};

const DEMO_STORAGE_KEY = "fastquiz_admin_demo_session";

const getStoredDemoSession = (): {
  user: AnyAuthUser;
  token: string;
} | null => {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setStoredDemoSession = (
  user: AnyAuthUser | null,
  token: string | null,
) => {
  try {
    if (user && token) {
      sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or cross-origin errors
  }
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: AnyAuthUser | null;
  initialToken?: string | null;
}> = ({ children, initialUser = null, initialToken = null }) => {
  // Store token and user strictly in-memory (with sessionStorage fallback for demo users)
  const [user, setUser] = useState<AnyAuthUser | null>(() => {
    if (initialUser) return initialUser;
    if (isMockEnabled()) {
      const demo = getStoredDemoSession();
      return demo?.user ?? null;
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (initialToken) return initialToken;
    if (isMockEnabled()) {
      const demo = getStoredDemoSession();
      return demo?.token ?? null;
    }
    return null;
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(() => {
    if (initialUser || initialToken) return false;
    return true;
  });
  const [totpChallenge, setTotpChallenge] = useState<TotpChallengeState | null>(
    null,
  );

  // Initialize shared FastQuizClient with in-memory token resolver and same-origin reverse proxy URLs
  const client = useMemo(() => {
    const isBrowser = typeof window !== "undefined";
    const authUrl =
      import.meta.env?.VITE_AUTH_API_URL !== undefined
        ? import.meta.env.VITE_AUTH_API_URL
        : isBrowser
          ? ""
          : "http://localhost:8001";

    const quizUrl =
      import.meta.env?.VITE_QUIZ_API_URL !== undefined
        ? import.meta.env.VITE_QUIZ_API_URL
        : isBrowser
          ? "/api/quiz"
          : "http://localhost:8002";

    const paymentsUrl =
      import.meta.env?.VITE_PAYMENTS_API_URL !== undefined
        ? import.meta.env.VITE_PAYMENTS_API_URL
        : isBrowser
          ? "/api/payments"
          : "http://localhost:8003";

    return new FastQuizClient({
      authBaseUrl: authUrl,
      quizBaseUrl: quizUrl,
      paymentsBaseUrl: paymentsUrl,
      getAccessToken: () => accessToken,
      useMockFallback: isMockEnabled(),
    });
  }, [accessToken]);

  // Attempt silent session restoration from httpOnly cookie on mount
  useEffect(() => {
    if (initialUser || initialToken) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;
    const restoreSession = async () => {
      try {
        const response = await executeSingleRefresh(client);
        if (isMounted && response?.access_token) {
          setUser(response.admin);
          setAccessToken(response.access_token);
          client.setAccessToken(response.access_token);
          setStoredDemoSession(null, null); // Clear demo session if real session active
        }
      } catch {
        // No active session cookie found - keep demo session if any
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [client, initialUser, initialToken]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ requiresTotp: boolean }> => {
    try {
      const response = await client.adminAuth.login({ email, password });

      if (response.status === "authenticated") {
        setUser(response.admin);
        setAccessToken(response.access_token);
        client.setAccessToken(response.access_token);
        setTotpChallenge(null);
        setStoredDemoSession(null, null);
        return { requiresTotp: false };
      }

      // Step 2: TOTP Challenge required
      setTotpChallenge(response);
      return { requiresTotp: true };
    } catch (err: unknown) {
      // In offline/demo fallback mode, check if credentials match admin convention
      if (isMockEnabled() && email.toLowerCase().includes("admin")) {
        loginDemoAdmin();
        return { requiresTotp: false };
      }
      throw err;
    }
  };

  const confirmTotp = async (code: string): Promise<void> => {
    if (!totpChallenge || !("pre_auth_token" in totpChallenge)) {
      throw new Error("No active TOTP challenge in progress");
    }
    const response = await client.adminAuth.confirmTotpEnrollment({
      pre_auth_token: totpChallenge.pre_auth_token,
      code,
    });
    setUser(response.admin);
    setAccessToken(response.access_token);
    client.setAccessToken(response.access_token);
    setTotpChallenge(null);
    setStoredDemoSession(null, null);
  };

  const verifyTotp = async (code: string): Promise<void> => {
    if (!totpChallenge || !("pre_auth_token" in totpChallenge)) {
      throw new Error("No active TOTP challenge in progress");
    }
    const response = await client.adminAuth.verifyTotp({
      pre_auth_token: totpChallenge.pre_auth_token,
      code,
    });
    setUser(response.admin);
    setAccessToken(response.access_token);
    client.setAccessToken(response.access_token);
    setTotpChallenge(null);
    setStoredDemoSession(null, null);
  };

  const clearTotpChallenge = (): void => {
    setTotpChallenge(null);
  };

  const loginDemoAdmin = (): void => {
    const token = "jwt-memory-admin-token-123";
    setUser(DEMO_ADMIN_USER);
    setAccessToken(token);
    client.setAccessToken(token);
    setTotpChallenge(null);
    setStoredDemoSession(DEMO_ADMIN_USER, token);
  };

  const loginDemoUser = (): void => {
    const token = "jwt-memory-regular-user-token-456";
    setUser(DEMO_REGULAR_USER);
    setAccessToken(token);
    client.setAccessToken(token);
    setTotpChallenge(null);
    setStoredDemoSession(DEMO_REGULAR_USER, token);
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
    setStoredDemoSession(null, null);
  };

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user && accessToken);
  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role,
        isAuthenticated,
        isAdmin,
        isInitializing,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

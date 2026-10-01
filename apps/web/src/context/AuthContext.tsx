import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { isMockEnabled } from "../config/env";

export interface UserIdentity {
  provider: string;
  provider_user_id: string;
  email_at_link?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  tierTitle: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  isPro: boolean;
  status?: string;
  emailVerified?: boolean;
  identities?: UserIdentity[];
  hasPassword?: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: "usr-rohan-1",
  name: "Rohan V.",
  email: "rohan.v@techscholar.dev",
  role: "user",
  tierTitle: "Pro Scholar",
  streakDays: 4,
  xp: 240,
  avatarUrl: "/assets/avatar.png",
  isPro: true,
  status: "active",
  emailVerified: true,
  hasPassword: true,
  identities: [
    {
      provider: "password",
      provider_user_id: "usr-rohan-1",
      created_at: new Date().toISOString(),
    },
  ],
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  loginGuest: () => void;
  loginOAuth: (provider: "google" | "github", nextUrl?: string) => void;
  signup: (
    name: string,
    email: string,
    password?: string,
  ) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  addXp: (amount: number) => void;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isGoogleAvatarHost = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase() === "lh3.googleusercontent.com";
  } catch {
    return false;
  }
};

const toPersistedUser = (
  profile: UserProfile,
): Omit<UserProfile, "hasPassword"> => {
  // Strip password indicator to avoid sensitive credential patterns in local storage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hasPassword, ...safeUser } = profile;
  return safeUser;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("fastquiz_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            (!parsed.avatarUrl || isGoogleAvatarHost(parsed.avatarUrl))
          ) {
            parsed.avatarUrl = "/assets/avatar.png";
          }
          if (parsed) {
            parsed.hasPassword = false;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("fastquiz_access_token");
      }
    } catch {
      // fallback
    }
    return null;
  });

  const isTestOrMock = useCallback(() => {
    return (
      isMockEnabled() ||
      (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test")
    );
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (isTestOrMock()) {
      setIsLoading(false);
      return user;
    }

    try {
      const res = await fetch("/auth/me", {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email || "",
          role: "user",
          tierTitle: "Scholar",
          streakDays: 1,
          xp: 100,
          avatarUrl: data.avatar_url || "/assets/avatar.png",
          isPro: false,
          status: data.status,
          emailVerified: data.email_verified,
          identities: data.identities,
          hasPassword: data.has_password,
        };
        setUser(profile);
        return profile;
      } else {
        // Not authenticated
        setUser(null);
        return null;
      }
    } catch {
      // Network or offline error
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, user, isTestOrMock]);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        if (user) {
          window.localStorage.setItem(
            "fastquiz_user",
            JSON.stringify(toPersistedUser(user)),
          );
        } else {
          window.localStorage.removeItem("fastquiz_user");
        }
      }
    } catch {
      // fallback
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    if (isTestOrMock()) {
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        email,
        name: email.split("@")[0] || "Learner",
      };
      setUser(newUser);
      const mockToken = `jwt-${Date.now()}`;
      setToken(mockToken);
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("fastquiz_access_token", mockToken);
        }
      } catch {
        // fallback
      }
      return;
    }

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password: password || "" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Sign in failed" }));
      throw new Error(err.detail || "Sign in failed");
    }

    const data = await res.json();
    setToken(data.access_token);
    const profile: UserProfile = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email || "",
      role: "user",
      tierTitle: "Scholar",
      streakDays: 1,
      xp: 100,
      avatarUrl: data.user.avatar_url || "/assets/avatar.png",
      isPro: false,
      status: data.user.status,
      emailVerified: data.user.email_verified,
      identities: data.user.identities,
      hasPassword: data.user.has_password,
    };
    setUser(profile);
  };

  const loginGuest = () => {
    setUser(DEFAULT_USER);
    setToken("demo-jwt-token-rohan");
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          "fastquiz_access_token",
          "demo-jwt-token-rohan",
        );
      }
    } catch {
      // fallback
    }
  };

  const loginOAuth = (
    provider: "google" | "github",
    nextUrl: string = "/curriculum",
  ) => {
    if (isTestOrMock()) {
      const isGoogle = provider === "google";
      const oAuthUser: UserProfile = {
        id: isGoogle ? "usr-google-alex" : "usr-github-alex",
        name: isGoogle ? "Alex Chen" : "Alex Chen",
        email: isGoogle ? "alex.chen@gmail.com" : "alex-chen@github.com",
        role: "user",
        tierTitle: isGoogle ? "Google Engineer" : "Open Source Architect",
        streakDays: isGoogle ? 6 : 5,
        xp: isGoogle ? 350 : 310,
        avatarUrl: "/assets/avatar.png",
        isPro: true,
        status: "active",
        emailVerified: true,
      };
      setUser(oAuthUser);
      const mockToken = `oauth-${provider}-${Date.now()}`;
      setToken(mockToken);
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("fastquiz_access_token", mockToken);
          window.localStorage.setItem(
            "fastquiz_user",
            JSON.stringify(toPersistedUser(oAuthUser)),
          );
        }
      } catch {
        // fallback
      }
      return;
    }

    // Real OAuth flow: redirect to backend /auth/{provider}/login
    const targetUrl = `/auth/${provider}/login?next=${encodeURIComponent(nextUrl)}`;
    window.location.href = targetUrl;
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
  ): Promise<UserProfile | null> => {
    if (isTestOrMock()) {
      const newUser: UserProfile = {
        id: `usr-new-${Date.now()}`,
        name: name.trim() || "New Engineer",
        email: email.trim(),
        role: "user",
        tierTitle: "Emerging Scholar",
        streakDays: 1,
        xp: 50,
        avatarUrl: "/assets/avatar.png",
        isPro: false,
        status: "active",
        emailVerified: true,
      };
      setUser(newUser);
      const mockToken = `jwt-signup-${Date.now()}`;
      setToken(mockToken);
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("fastquiz_access_token", mockToken);
          window.localStorage.setItem(
            "fastquiz_user",
            JSON.stringify(toPersistedUser(newUser)),
          );
        }
      } catch {
        // fallback
      }
      return newUser;
    }

    const res = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password: password || "",
      }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }

    const data = await res.json();
    setToken(data.access_token);
    const profile: UserProfile = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email || "",
      role: "user",
      tierTitle: "Emerging Scholar",
      streakDays: 1,
      xp: 50,
      avatarUrl: data.user.avatar_url || "/assets/avatar.png",
      isPro: false,
      status: data.user.status,
      emailVerified: data.user.email_verified,
      identities: data.user.identities,
      hasPassword: data.user.has_password,
    };
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    if (!isMockEnabled()) {
      try {
        await fetch("/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    setUser(null);
    setToken(null);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("fastquiz_access_token");
        window.localStorage.removeItem("fastquiz_user");
      }
    } catch {
      // fallback
    }
  };

  const addXp = (amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, xp: prev.xp + amount };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        loginGuest,
        loginOAuth,
        signup,
        logout,
        addXp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

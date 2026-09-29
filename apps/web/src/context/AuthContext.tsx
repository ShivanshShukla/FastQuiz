import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  tierTitle: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  isPro: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-rohan-1',
  name: 'Rohan V.',
  email: 'rohan.v@techscholar.dev',
  role: 'user',
  tierTitle: 'Pro Scholar',
  streakDays: 4,
  xp: 240,
  avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UqIx93fD3QQEE3C22qcCiZQUkEfNSSdLSA3GM9pAgqT1z0CgkE5W4AAPqdv4ueHW3aZrTq7QhQbxM8nSq_vYBMgPrbKXX0Dbn_aHCWRvySQ3ct-yoOpPyuwO84nOZPVTHvqtcpZkKhxQpiVBZaSU0HxQH1lCMNtB4-YfLC2pAucHvIFL5ZfTnUmxJntDM2h3R95wI5dEiEtQhEWEQHo_1ArE97PVqhg6pXmC-s3QcfqBPMSpkqf4COCWQ',
  isPro: true,
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, name?: string) => void;
  loginGuest: () => void;
  logout: () => void;
  addXp: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('fastquiz_user');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER; // Default logged in as Rohan V. for seamless preview matching Stitch
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('fastquiz_access_token') || 'demo-jwt-token-rohan';
      }
    } catch {
      // fallback
    }
    return 'demo-jwt-token-rohan';
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem('fastquiz_user', JSON.stringify(user));
        } else {
          window.localStorage.removeItem('fastquiz_user');
        }
      }
    } catch {
      // fallback
    }
  }, [user]);

  const login = (email: string, name: string = 'Learner') => {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      name,
    };
    setUser(newUser);
    const mockToken = `jwt-${Date.now()}`;
    setToken(mockToken);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('fastquiz_access_token', mockToken);
      }
    } catch {
      // fallback
    }
  };

  const loginGuest = () => {
    setUser(DEFAULT_USER);
    setToken('demo-jwt-token-rohan');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('fastquiz_access_token', 'demo-jwt-token-rohan');
      }
    } catch {
      // fallback
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('fastquiz_access_token');
        window.localStorage.removeItem('fastquiz_user');
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
        token,
        login,
        loginGuest,
        logout,
        addXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

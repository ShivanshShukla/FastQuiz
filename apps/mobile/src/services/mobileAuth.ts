/**
 * FastQuiz Mobile Authentication Service (Expo)
 *
 * Implements Authorization Code + PKCE social exchange via auth-service,
 * storing FastQuiz tokens securely in Expo.SecureStore (never AsyncStorage)
 * to comply with Zero Account Takeover and DPDPA storage standards.
 */

export interface MobileAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MobileUserProfile {
  id: string;
  name: string;
  email: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  status: string;
  source: string;
}

export interface MobileAuthResult {
  tokens: MobileAuthTokens;
  user: MobileUserProfile;
}

interface SecureStoreModule {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
}

// Storage keys
const SECURE_ACCESS_TOKEN_KEY = "fastquiz_mobile_access_token";
const SECURE_REFRESH_TOKEN_KEY = "fastquiz_mobile_refresh_token";

// Dynamic SecureStore loader (with safe in-memory fallback if native module is absent in test)
class MobileSecureStorage {
  private memoryStore: Map<string, string> = new Map();

  private async getSecureStore(): Promise<SecureStoreModule | null> {
    try {
      const moduleName = "expo-secure-store";
      return (await import(/* @vite-ignore */ moduleName)) as SecureStoreModule;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const SecureStore = await this.getSecureStore();
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
    } else {
      this.memoryStore.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    const SecureStore = await this.getSecureStore();
    if (SecureStore) {
      return await SecureStore.getItemAsync(key);
    }
    return this.memoryStore.get(key) || null;
  }

  async removeItem(key: string): Promise<void> {
    const SecureStore = await this.getSecureStore();
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
    } else {
      this.memoryStore.delete(key);
    }
  }
}

export const secureStorage = new MobileSecureStorage();

/**
 * Exchanges the OAuth authorization code and PKCE code_verifier with FastQuiz auth-service.
 * Tokens are never handled by third-party browser contexts directly.
 */
export async function exchangeMobileOAuthCode(
  apiBaseUrl: string,
  provider: "google" | "github",
  code: string,
  codeVerifier: string,
  redirectUri?: string,
): Promise<MobileAuthResult> {
  const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/auth/${provider}/mobile`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Mobile OAuth exchange failed" }));
    throw new Error(
      errorData.detail ||
        `OAuth exchange failed with status ${response.status}`,
    );
  }

  const data = await response.json();

  const tokens: MobileAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };

  // Securely persist in Expo SecureStore
  await secureStorage.setItem(SECURE_ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    await secureStorage.setItem(SECURE_REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  const user: MobileUserProfile = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.email_verified,
    avatarUrl: data.user.avatar_url,
    status: data.user.status,
    source: data.user.source,
  };

  return { tokens, user };
}

/**
 * Retrieves persisted access and refresh tokens from SecureStore.
 */
export async function getStoredMobileTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    secureStorage.getItem(SECURE_ACCESS_TOKEN_KEY),
    secureStorage.getItem(SECURE_REFRESH_TOKEN_KEY),
  ]);
  return { accessToken, refreshToken };
}

/**
 * Rotates the refresh token against auth-service and stores the new rotated token.
 */
export async function refreshMobileTokens(apiBaseUrl: string): Promise<string> {
  const { refreshToken } = await getStoredMobileTokens();
  if (!refreshToken) {
    throw new Error("No refresh token stored");
  }

  const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/auth/refresh`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ body_refresh_token: refreshToken }),
  });

  if (!response.ok) {
    await clearMobileTokens();
    throw new Error(
      "Session expired or token reuse detected. Please log in again.",
    );
  }

  const data = await response.json();
  await secureStorage.setItem(SECURE_ACCESS_TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    await secureStorage.setItem(SECURE_REFRESH_TOKEN_KEY, data.refresh_token);
  }
  return data.access_token;
}

/**
 * Clears stored tokens on logout.
 */
export async function clearMobileTokens(): Promise<void> {
  await Promise.all([
    secureStorage.removeItem(SECURE_ACCESS_TOKEN_KEY),
    secureStorage.removeItem(SECURE_REFRESH_TOKEN_KEY),
  ]);
}

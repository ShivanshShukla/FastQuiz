/**
 * FastQuiz Web Client Environment Configuration Resolver
 *
 * Enforces production build-time constant folding so overrides and mock data
 * are completely stripped from production bundles by Rollup/Vite.
 * Resolves mock mode once at boot to prevent mid-session SPA state flipping.
 */

const STORAGE_OVERRIDE_KEY = "fastquiz_mock_override";

function safeGetLocalStorage(): Storage | null {
  try {
    if (
      typeof window !== "undefined" &&
      "localStorage" in window &&
      window.localStorage
    ) {
      return window.localStorage;
    }
  } catch {
    // Restricted iframes or test environments
  }
  return null;
}

/**
 * Resolves mock mode once on boot.
 */
function resolveInitialMockMode(): {
  enabled: boolean;
  source: "url" | "storage" | "env";
} {
  // 1. Build-time constant folding in production:
  // If not in development mode and VITE_MOCK_ON is not explicitly 'true',
  // fold at build time so overrides never work on production deployments.
  if (!import.meta.env.DEV && import.meta.env.VITE_MOCK_ON !== "true") {
    return { enabled: false, source: "env" };
  }

  if (typeof window !== "undefined") {
    // 2. High-priority URL query parameter on boot: ?mock=true or ?mock=false
    try {
      if (window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("mock");
        if (query === "true") return { enabled: true, source: "url" };
        if (query === "false") return { enabled: false, source: "url" };
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 3. Developer manual override saved in localStorage (dev-only)
    const storage = safeGetLocalStorage();
    if (storage) {
      try {
        const stored = storage.getItem(STORAGE_OVERRIDE_KEY);
        if (stored === "true") return { enabled: true, source: "storage" };
        if (stored === "false") return { enabled: false, source: "storage" };
      } catch {
        // Ignore read errors
      }
    }
  }

  // 4. Fallback to Vite environment configuration
  const envVal = import.meta.env?.VITE_MOCK_ON;
  return { enabled: envVal === "true" || envVal === true, source: "env" };
}

// Cached once at application startup to prevent mid-session SPA flipping
const INITIAL_RESOLUTION = resolveInitialMockMode();

export function isMockEnabled(): boolean {
  // Constant fold for production builds:
  if (!import.meta.env.DEV && import.meta.env.VITE_MOCK_ON !== "true") {
    return false;
  }
  // In test runners (Vitest / JSDOM), allow dynamic resolution so test suites can toggle mock mode in beforeEach
  if (import.meta.env.MODE === "test") {
    return resolveInitialMockMode().enabled;
  }
  return INITIAL_RESOLUTION.enabled;
}

export function getMockModeSource(): "url" | "storage" | "env" {
  if (!import.meta.env.DEV && import.meta.env.VITE_MOCK_ON !== "true") {
    return "env";
  }
  if (import.meta.env.MODE === "test") {
    return resolveInitialMockMode().source;
  }
  return INITIAL_RESOLUTION.source;
}

export function setMockOverride(enabled: boolean | null): void {
  if (!import.meta.env.DEV && import.meta.env.VITE_MOCK_ON !== "true") {
    console.warn("FastQuiz: Mock overrides are disabled in production builds.");
    return;
  }

  const storage = safeGetLocalStorage();
  if (storage) {
    try {
      if (enabled === null) {
        storage.removeItem(STORAGE_OVERRIDE_KEY);
      } else {
        storage.setItem(STORAGE_OVERRIDE_KEY, enabled ? "true" : "false");
      }
    } catch {
      // Ignore write errors
    }
  }
  if (typeof window !== "undefined" && window.location?.reload) {
    window.location.reload();
  }
}

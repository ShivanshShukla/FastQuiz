/**
 * FastQuiz Admin App Environment Configuration Resolver
 * Controls whether synthetic mock datasets and developer quick-login keys are active.
 */

const STORAGE_OVERRIDE_KEY = 'fastquiz_mock_override';

function safeGetLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access denied in restricted iframes or Node.js test environments
  }
  return null;
}

export function isMockEnabled(): boolean {
  if (typeof window !== 'undefined') {
    // 1. High-priority URL query parameter: ?mock=true or ?mock=false
    try {
      if (window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('mock');
        if (query === 'true') return true;
        if (query === 'false') return false;
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 2. Developer manual override saved in localStorage
    const storage = safeGetLocalStorage();
    if (storage) {
      try {
        const stored = storage.getItem(STORAGE_OVERRIDE_KEY);
        if (stored === 'true') return true;
        if (stored === 'false') return false;
      } catch {
        // Ignore read errors
      }
    }
  }

  // 3. Fallback to Vite environment configuration
  const envVal = import.meta.env?.VITE_MOCK_ON ?? import.meta.env?.MOCK_ON;
  if (envVal !== undefined) {
    return envVal === 'true' || envVal === true;
  }
  return true;
}

export function setMockOverride(enabled: boolean | null): void {
  const storage = safeGetLocalStorage();
  if (storage) {
    try {
      if (enabled === null) {
        storage.removeItem(STORAGE_OVERRIDE_KEY);
      } else {
        storage.setItem(STORAGE_OVERRIDE_KEY, enabled ? 'true' : 'false');
      }
    } catch {
      // Ignore write errors
    }
  }
  if (typeof window !== 'undefined' && window.location?.reload) {
    window.location.reload();
  }
}

export function getMockModeSource(): 'url' | 'storage' | 'env' {
  if (typeof window !== 'undefined') {
    try {
      if (window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('mock')) return 'url';
      }
    } catch {
      // Ignore URL parsing errors
    }
    const storage = safeGetLocalStorage();
    if (storage) {
      try {
        if (storage.getItem(STORAGE_OVERRIDE_KEY) !== null) return 'storage';
      } catch {
        // Ignore
      }
    }
  }
  return 'env';
}

/**
 * Safe LocalStorage wrapper with in-memory fallback.
 * Prevents Uncaught DOMException (QuotaExceededError / SecurityError in iframes).
 */

const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage blocked or unavailable
    }
    return memoryStore.get(key) ?? null;
  },

  setItem: (key: string, value: string): void => {
    memoryStore.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // QuotaExceededError or SecurityError - memory fallback already holds the value
      console.warn(`[safeStorage] Could not persist key "${key}" to localStorage:`, e);
    }
  },

  removeItem: (key: string): void => {
    memoryStore.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  },

  getJSON: <T>(key: string, defaultValue: T): T => {
    const raw = safeStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultValue;
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      safeStorage.setItem(key, serialized);
    } catch (e) {
      console.warn(`[safeStorage] Could not serialize key "${key}":`, e);
    }
  }
};

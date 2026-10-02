/**
 * Thin persistence layer. Everything the app reads/writes goes through here so
 * a future backend (Supabase) only needs this file swapped.
 */
const PREFIX = "peakcycle:";

export const storage = {
  read<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota or private mode — data stays in memory for this session */
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PREFIX + key);
  },
};

export const KEYS = {
  products: "products",
  reservations: "reservations",
  session: "session",
} as const;

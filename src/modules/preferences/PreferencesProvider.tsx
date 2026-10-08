"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { setApiLanguageProvider } from "@/modules/http/api-client";
import { type Language, type TranslationKey } from "./dictionaries";
import { THEME_STORAGE_KEY, type ThemePreference } from "./theme-script";
import { DEFAULT_LANGUAGE, translate, type TranslateVars } from "./translate";


type PreferencesContextValue = {
  language: Language;
  /** BCP 47 locale for Intl formatting. */
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
  theme: ThemePreference;
  /** The theme actually shown (system resolved through prefers-color-scheme). */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
};

const LANGUAGE_STORAGE_KEY = "opensuite.language";
const locales: Record<Language, string> = { id: "id-ID", en: "en-GB" };

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const listeners = new Set<() => void>();

function emitPreferenceChange() {
  listeners.forEach((listener) => listener());
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "id";
}

function isTheme(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode: keep the in-memory choice only
  }
}

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  const storedLanguage = readStorage(LANGUAGE_STORAGE_KEY);
  return isLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
}

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = readStorage(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
}

function subscribeToPreferences(listener: () => void) {
  listeners.add(listener);

  function handleStorageEvent(event: StorageEvent) {
    if (event.key === LANGUAGE_STORAGE_KEY || event.key === THEME_STORAGE_KEY) {
      listener();
    }
  }

  window.addEventListener("storage", handleStorageEvent);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(listener: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function applyTheme(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

type PreferencesProviderProps = {
  children: React.ReactNode;
};

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const language = useSyncExternalStore(
    subscribeToPreferences,
    getStoredLanguage,
    () => DEFAULT_LANGUAGE,
  );
  const theme = useSyncExternalStore(subscribeToPreferences, getStoredTheme, () => "system" as const);
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, () => window.matchMedia(DARK_QUERY).matches, () => false);
  const resolvedTheme = theme === "dark" || (theme === "system" && systemDark) ? "dark" : "light";

  useEffect(() => {
    document.documentElement.lang = language;
    setApiLanguageProvider(() => language);
  }, [language]);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      locale: locales[language],
      setLanguage: (nextLanguage) => {
        writeStorage(LANGUAGE_STORAGE_KEY, nextLanguage);
        emitPreferenceChange();
      },
      t: (key, vars) => translate(language, key, vars),
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        writeStorage(THEME_STORAGE_KEY, nextTheme);
        emitPreferenceChange();
      },
    }),
    [language, resolvedTheme, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return context;
}

/**
 * Overrides theme variables at runtime without a rebuild, e.g.
 * `applyThemeOverrides({ "--accent-hue": "20" })`.
 */
export function applyThemeOverrides(overrides: Record<`--${string}`, string>) {
  for (const [name, value] of Object.entries(overrides)) {
    document.documentElement.style.setProperty(name, value);
  }
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  dictionaries,
  type Language,
  type TranslationKey,
} from "./dictionaries";

type PreferencesContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const DEFAULT_LANGUAGE: Language = "en";
const LANGUAGE_STORAGE_KEY = "opensuite.language";

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const listeners = new Set<() => void>();

function emitPreferenceChange() {
  listeners.forEach((listener) => listener());
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "id";
}

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return isLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
}

function subscribeToPreferences(listener: () => void) {
  listeners.add(listener);

  function handleStorageEvent(event: StorageEvent) {
    if (event.key === LANGUAGE_STORAGE_KEY) {
      listener();
    }
  }

  window.addEventListener("storage", handleStorageEvent);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageEvent);
  };
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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
        emitPreferenceChange();
      },
      t: (key) => dictionaries[language][key],
    }),
    [language],
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

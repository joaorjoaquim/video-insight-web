"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { en } from "./locales/en";
import { ptBr } from "./locales/pt-br";
import type { TranslationKey } from "./locales/en";

export type Locale = "en" | "pt-br";

const locales: Record<Locale, typeof en> = { en, "pt-br": ptBr };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("locale") as Locale | null;
  if (saved === "en" || saved === "pt-br") return saved;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith("pt") ? "pt-br" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => locales[locale][key] ?? locales["en"][key] ?? key,
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

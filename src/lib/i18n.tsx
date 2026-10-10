"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations, Translations } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const savedLocale = localStorage.getItem("jobfinder_locale") as Locale | null;
    if (savedLocale && ["fr", "en", "ar"].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("jobfinder_locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale] || translations.fr,
        dir,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "fr" as Locale,
      setLocale: () => {},
      t: translations.fr,
      dir: "ltr" as const,
    };
  }
  return context;
}

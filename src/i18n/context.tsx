"use client";

import { createContext, useContext, useMemo } from "react";
import { getDict, type Dict, type Locale } from "./index";

type Value = { locale: Locale; dict: Dict };

const LocaleContext = createContext<Value | null>(null);

/**
 * Словарь держит функции склонения, а функции через границу server → client
 * не сериализуются. Поэтому вниз уходит только строка локали, а словарь
 * клиентские компоненты собирают у себя.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dict: getDict(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): Value {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useI18n вызван вне LocaleProvider");
  return value;
}

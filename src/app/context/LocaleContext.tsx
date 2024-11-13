'use client';

import { createContext, useContext, ReactNode } from 'react';
import { sv, Locale } from '../i18n/sv';

export const LocaleContext = createContext<Locale>(sv);

export const useLocale = () => useContext(LocaleContext);

export function LocaleProvider({ children }: { children: ReactNode }) {
  return <LocaleContext.Provider value={sv}>{children}</LocaleContext.Provider>;
}

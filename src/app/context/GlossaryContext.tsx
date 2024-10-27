/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Glossary } from '../components/GlossaryEditor';

interface GlossaryContextProps {
  glossary: Glossary;
  setGlossary: (glossary: Glossary) => void;
}

const GlossaryContext = createContext<GlossaryContextProps | undefined>(undefined);

export const useGlossary = (): GlossaryContextProps => {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossary must be used within a GlossaryProvider');
  }
  return context;
};

interface GlossaryProviderProps {
  children: ReactNode;
}

export const GlossaryProvider = ({ children }: GlossaryProviderProps) => {
  const [glossary, setGlossary] = useState<Glossary>({
    name: 'Anonymous',
    fromLanguage: 'se',
    toLanguage: 'en',
    items: [],
  });

  return <GlossaryContext.Provider value={{ glossary, setGlossary }}>{children}</GlossaryContext.Provider>;
};

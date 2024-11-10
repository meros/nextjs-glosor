/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Glossary } from '../components/GlossaryEditor';

interface GlossaryContextValue {
  glossary: Glossary;
  setGlossary: (glossary: Glossary) => void;
}

const GlossaryContext = createContext<GlossaryContextValue | undefined>(undefined);

export const useGlossary = (): GlossaryContextValue => {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossary must be used within a GlossaryProvider');
  }
  return context;
};

interface GlossaryProviderProps {
  children: ReactNode;
}

export const GlossaryProvider: React.FC<GlossaryProviderProps> = ({ children }) => {
  const [glossary, setGlossary] = useState<Glossary>({
    name: 'Anonymous',
    fromLanguage: 'se',
    toLanguage: 'en',
    items: [],
  });

  return <GlossaryContext.Provider value={{ glossary, setGlossary }}>{children}</GlossaryContext.Provider>;
};

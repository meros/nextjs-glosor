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
  // Easy vocabulary set in German
  const easyGermanGlossary: Glossary = {
    fromLanguage: 'sv',
    toLanguage: 'de',
    items: [
      { a: 'Hus', b: 'Haus' },
      { a: 'Bil', b: 'Auto' },
      { a: 'Cykel', b: 'Fahrrad' },
      { a: 'Båt', b: 'Boot' },
    ],
  };

  // Medium vocabulary set in English
  const mediumEnglishGlossary: Glossary = {
    fromLanguage: 'sv',
    toLanguage: 'en',
    items: [
      { a: 'Hund', b: 'Dog' },
      { a: 'Katt', b: 'Cat' },
      { a: 'Bord', b: 'Table' },
      { a: 'Stol', b: 'Chair' },
      { a: 'Fönster', b: 'Window' },
      { a: 'Dörr', b: 'Door' },
    ],
  };

  // Hard vocabulary set in French
  const hardFrenchGlossary: Glossary = {
    fromLanguage: 'sv',
    toLanguage: 'fr',
    items: [
      { a: 'Bibliotek', b: 'Bibliothèque' },
      { a: 'Universitet', b: 'Université' },
      { a: 'Kultur', b: 'Culture' },
      { a: 'Natur', b: 'Nature' },
      { a: 'Möjlighet', b: 'Possibilité' },
      { a: 'Vänskap', b: 'Amitié' },
    ],
  };

  // Harder vocabulary set in advanced German (additional vocabulary)
  const advancedGermanGlossary: Glossary = {
    fromLanguage: 'sv',
    toLanguage: 'de',
    items: [
      { a: 'Vetenskap', b: 'Wissenschaft' },
      { a: 'Samhälle', b: 'Gesellschaft' },
      { a: 'Förändring', b: 'Veränderung' },
      { a: 'Utveckling', b: 'Entwicklung' },
      { a: 'Erfarenhet', b: 'Erfahrung' },
      { a: 'Ansvar', b: 'Verantwortung' },
    ],
  };

  // Uncomment one of the following lines to select a specific glossary set
  // const [glossary, setGlossary] = useState<Glossary>(easyGermanGlossary);
  // const [glossary, setGlossary] = useState<Glossary>(mediumEnglishGlossary);
  // const [glossary, setGlossary] = useState<Glossary>(hardFrenchGlossary);
  const [glossary, setGlossary] = useState<Glossary>(advancedGermanGlossary);

  return <GlossaryContext.Provider value={{ glossary, setGlossary }}>{children}</GlossaryContext.Provider>;
};

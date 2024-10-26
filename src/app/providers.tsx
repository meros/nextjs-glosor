'use client';

import { useMemo } from 'react';
import { GlossaryProvider, useGlossary } from './context/GlossaryContext';
import { TrainingProvider } from './context/TrainingContext';
import './globals.css';

function Reactors({ children }: Readonly<{ children: React.ReactNode }>) {
  const { glossary } = useGlossary();

  const items = useMemo(
    () =>
      glossary.items.flatMap((item) => [
        {
          from: item.a,
          to: item.b,
          correct: 0,
          total: 0,
          lastReviewed: Date.now(),
          confidence: 0,
          fromLanguage: glossary.fromLanguage,
          toLanguage: glossary.toLanguage,
        },
        {
          from: item.b,
          to: item.a,
          correct: 0,
          total: 0,
          lastReviewed: Date.now(),
          confidence: 0,
          fromLanguage: glossary.toLanguage,
          toLanguage: glossary.fromLanguage,
        },
      ]),
    [glossary],
  );

  return <TrainingProvider initialItems={items}>{children}</TrainingProvider>;
}

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GlossaryProvider>
      <Reactors>{children}</Reactors>
    </GlossaryProvider>
  );
}

'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from 'react';
import { Glossary, parseGlossaries } from '@/lib/glossary';
import { glossaryReducer, GlossaryAction, GlossaryState } from '@/lib/glossaryReducer';
import { sampleGlossaries } from '@/lib/samples';
import { hasStored, readStored, writeStored } from '@/lib/storage';

const GLOSSARIES_KEY = 'glossaries';
const SELECTED_KEY = 'selectedGlossaryId';

interface GlossaryContextValue {
  /** False until the saved lists are read. The server renders the same output as the first client render. */
  ready: boolean;
  glossaries: Glossary[];
  selected: Glossary | null;
  dispatch: (action: GlossaryAction) => void;
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function useGlossaries(): GlossaryContextValue {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossaries must be used within a GlossaryProvider');
  }
  return context;
}

const emptyState: GlossaryState = { glossaries: [], selectedId: null, hydrated: false };

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(glossaryReducer, emptyState);
  const ready = state.hydrated;

  useEffect(() => {
    const glossaries = hasStored(GLOSSARIES_KEY) ? readStored(GLOSSARIES_KEY, parseGlossaries, []) : sampleGlossaries();
    const selectedId = readStored<string | null>(
      SELECTED_KEY,
      (value) => (typeof value === 'string' ? value : null),
      null,
    );
    dispatch({ type: 'hydrate', state: { glossaries, selectedId } });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    writeStored(GLOSSARIES_KEY, state.glossaries);
    writeStored(SELECTED_KEY, state.selectedId);
  }, [ready, state]);

  const value = useMemo<GlossaryContextValue>(
    () => ({
      ready,
      glossaries: state.glossaries,
      selected: state.glossaries.find((glossary) => glossary.id === state.selectedId) ?? null,
      dispatch,
    }),
    [ready, state],
  );

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
}

'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Glossary } from '@/lib/glossary';
import { currentCard, initialPracticeState, practiceReducer, PracticeState } from '@/lib/practiceReducer';
import { readStored, writeStored } from '@/lib/storage';
import { buildCards, Card, Direction, parseCards, progress } from '@/lib/training';

const CARDS_KEY = 'trainingItems';
const CASE_KEY = 'isCaseSensitive';
const TITLE_KEY = 'trainingTitle';

interface PracticeContextValue {
  ready: boolean;
  state: PracticeState;
  card: Card | null;
  progress: { answered: number; total: number };
  start: (glossary: Glossary, direction: Direction) => void;
  submit: (input: string) => void;
  next: () => void;
  setCaseSensitive: (value: boolean) => void;
}

const PracticeContext = createContext<PracticeContextValue | null>(null);

export function usePractice(): PracticeContextValue {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(practiceReducer, initialPracticeState);
  const ready = state.hydrated;

  useEffect(() => {
    dispatch({
      type: 'hydrate',
      cards: readStored(CARDS_KEY, parseCards, []),
      title: readStored(TITLE_KEY, (value) => (typeof value === 'string' ? value : null), ''),
      caseSensitive: readStored(CASE_KEY, (value) => (typeof value === 'boolean' ? value : null), true),
    });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    writeStored(CARDS_KEY, state.cards);
    writeStored(TITLE_KEY, state.title);
    writeStored(CASE_KEY, state.caseSensitive);
  }, [ready, state.cards, state.title, state.caseSensitive]);

  const start = useCallback((glossary: Glossary, direction: Direction) => {
    dispatch({ type: 'start', cards: buildCards(glossary, direction), title: glossary.name });
  }, []);
  const submit = useCallback((input: string) => dispatch({ type: 'submit', input }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const setCaseSensitive = useCallback((value: boolean) => dispatch({ type: 'setCaseSensitive', value }), []);

  const value = useMemo<PracticeContextValue>(
    () => ({
      ready,
      state,
      card: currentCard(state),
      progress: progress(state.cards),
      start,
      submit,
      next,
      setCaseSensitive,
    }),
    [ready, state, start, submit, next, setCaseSensitive],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

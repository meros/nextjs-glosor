import { Card, Feedback, isCorrectAnswer, pickNext, recordResult } from './training';

export interface PracticeState {
  cards: Card[];
  title: string;
  currentId: string | null;
  feedback: Feedback | null;
  caseSensitive: boolean;
  /** False until saved progress is read, so server and first client render match. */
  hydrated: boolean;
}

export type PracticeAction =
  | { type: 'hydrate'; cards: Card[]; title: string; caseSensitive: boolean; random?: () => number }
  | { type: 'start'; cards: Card[]; title: string; random?: () => number }
  | { type: 'submit'; input: string }
  | { type: 'next'; random?: () => number }
  | { type: 'setCaseSensitive'; value: boolean };

export const initialPracticeState: PracticeState = {
  cards: [],
  title: '',
  currentId: null,
  feedback: null,
  caseSensitive: true,
  hydrated: false,
};

export function currentCard(state: PracticeState): Card | null {
  return state.cards.find((card) => card.id === state.currentId) ?? null;
}

export function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'hydrate':
    case 'start':
      return {
        hydrated: state.hydrated || action.type === 'hydrate',
        cards: action.cards,
        title: action.title,
        currentId: pickNext(action.cards, null, action.random)?.id ?? null,
        feedback: null,
        caseSensitive: action.type === 'hydrate' ? action.caseSensitive : state.caseSensitive,
      };
    case 'submit': {
      const card = currentCard(state);
      if (!card || state.feedback) {
        return state;
      }
      const isCorrect = isCorrectAnswer(card, action.input, state.caseSensitive);
      return {
        ...state,
        cards: recordResult(state.cards, card.id, isCorrect),
        feedback: { isCorrect, given: action.input.trim(), correctAnswer: card.to },
      };
    }
    case 'next':
      if (!state.feedback) {
        return state;
      }
      return {
        ...state,
        feedback: null,
        currentId: pickNext(state.cards, state.currentId, action.random)?.id ?? null,
      };
    case 'setCaseSensitive':
      return { ...state, caseSensitive: action.value };
  }
}

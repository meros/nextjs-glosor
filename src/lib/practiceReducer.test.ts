import { describe, expect, it } from 'vitest';
import { currentCard, initialPracticeState, practiceReducer, PracticeState } from './practiceReducer';
import { Card } from './training';

const cards: Card[] = [
  { id: 'a', from: 'Hus', to: 'Haus', fromLanguage: 'se', toLanguage: 'de', correct: 0, total: 0 },
  { id: 'b', from: 'Bil', to: 'Auto', fromLanguage: 'se', toLanguage: 'de', correct: 0, total: 0 },
];

function started(random = () => 0): PracticeState {
  return practiceReducer(initialPracticeState, { type: 'start', cards, title: 'Tyska', random });
}

describe('practiceReducer', () => {
  it('start picks a card and keeps the case setting', () => {
    const state = started();
    expect(currentCard(state)?.id).toBe('a');
    expect(state).toMatchObject({ title: 'Tyska', feedback: null, caseSensitive: true });
  });

  it('start with no cards leaves nothing to practice', () => {
    const state = practiceReducer(initialPracticeState, { type: 'start', cards: [], title: '' });
    expect(currentCard(state)).toBeNull();
  });

  it('hydrate restores the saved case setting and marks the state ready', () => {
    const state = practiceReducer(initialPracticeState, {
      type: 'hydrate',
      cards,
      title: 'x',
      caseSensitive: false,
      random: () => 0,
    });
    expect(state).toMatchObject({ hydrated: true, caseSensitive: false });
  });

  it('a correct answer scores and gives feedback', () => {
    const state = practiceReducer(started(), { type: 'submit', input: ' Haus ' });
    expect(state.feedback).toEqual({ isCorrect: true, given: 'Haus', correctAnswer: 'Haus' });
    expect(state.cards[0]).toMatchObject({ correct: 1, total: 1 });
  });

  it('a wrong answer records the attempt and shows the right answer', () => {
    const state = practiceReducer(started(), { type: 'submit', input: 'Auto' });
    expect(state.feedback).toEqual({ isCorrect: false, given: 'Auto', correctAnswer: 'Haus' });
    expect(state.cards[0]).toMatchObject({ correct: 0, total: 1 });
  });

  it('answers are checked against the case setting', () => {
    const lenient = practiceReducer(started(), { type: 'setCaseSensitive', value: false });
    expect(practiceReducer(lenient, { type: 'submit', input: 'haus' }).feedback?.isCorrect).toBe(true);
    expect(practiceReducer(started(), { type: 'submit', input: 'haus' }).feedback?.isCorrect).toBe(false);
  });

  it('a second submit while feedback is showing is ignored', () => {
    const answered = practiceReducer(started(), { type: 'submit', input: 'Haus' });
    expect(practiceReducer(answered, { type: 'submit', input: 'Haus' })).toBe(answered);
  });

  it('next without feedback does nothing', () => {
    const state = started();
    expect(practiceReducer(state, { type: 'next' })).toBe(state);
  });

  it('next clears the feedback and moves to a card with a lower score', () => {
    const answered = practiceReducer(started(), { type: 'submit', input: 'Haus' });
    const next = practiceReducer(answered, { type: 'next', random: () => 0 });
    expect(next.feedback).toBeNull();
    expect(currentCard(next)?.id).toBe('b');
  });

  it('submit with no current card does nothing', () => {
    expect(practiceReducer(initialPracticeState, { type: 'submit', input: 'x' })).toBe(initialPracticeState);
  });
});

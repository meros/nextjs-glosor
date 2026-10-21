import { describe, expect, it } from 'vitest';
import { Glossary } from './glossary';
import {
  buildCards,
  Card,
  isCorrectAnswer,
  normalizeAnswer,
  parseCards,
  pickNext,
  progress,
  recordResult,
} from './training';

const glossary: Glossary = {
  id: 'g1',
  name: 'Test',
  fromLanguage: 'se',
  toLanguage: 'de',
  items: [
    { id: 'w1', a: 'Hus', b: 'Haus' },
    { id: 'w2', a: 'Bil', b: 'Auto' },
  ],
};

function card(overrides: Partial<Card> = {}): Card {
  return { id: 'c', from: 'Hus', to: 'Haus', fromLanguage: 'se', toLanguage: 'de', correct: 0, total: 0, ...overrides };
}

describe('buildCards', () => {
  it('makes a card per direction', () => {
    expect(buildCards(glossary, 'both')).toHaveLength(4);
    expect(buildCards(glossary, 'fromTo').map((c) => [c.from, c.to])).toEqual([
      ['Hus', 'Haus'],
      ['Bil', 'Auto'],
    ]);
    expect(buildCards(glossary, 'toFrom').map((c) => [c.from, c.to, c.fromLanguage, c.toLanguage])).toEqual([
      ['Haus', 'Hus', 'de', 'se'],
      ['Auto', 'Bil', 'de', 'se'],
    ]);
  });

  it('gives every card its own id and a zero score', () => {
    const cards = buildCards(glossary, 'both');
    expect(new Set(cards.map((c) => c.id)).size).toBe(4);
    expect(cards.every((c) => c.correct === 0 && c.total === 0)).toBe(true);
  });

  it('returns no cards for an empty list', () => {
    expect(buildCards({ ...glossary, items: [] }, 'both')).toEqual([]);
  });
});

describe('answer checking', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeAnswer('  ett   hus ', true)).toBe('ett hus');
  });

  it('treats a decomposed å as the same as å', () => {
    expect(normalizeAnswer('å', true)).toBe('å');
  });

  it('respects case when case sensitive', () => {
    expect(isCorrectAnswer(card(), 'haus', true)).toBe(false);
    expect(isCorrectAnswer(card(), 'Haus', true)).toBe(true);
  });

  it('ignores case when not case sensitive', () => {
    expect(isCorrectAnswer(card(), 'HAUS', false)).toBe(true);
    expect(isCorrectAnswer(card({ to: 'Åke' }), 'åke', false)).toBe(true);
  });

  it('rejects a wrong or empty answer', () => {
    expect(isCorrectAnswer(card(), 'Auto', true)).toBe(false);
    expect(isCorrectAnswer(card(), '', true)).toBe(false);
  });
});

describe('pickNext', () => {
  it('returns null without cards', () => {
    expect(pickNext([])).toBeNull();
  });

  it('only picks among the cards answered correctly the fewest times', () => {
    const cards = [card({ id: 'a', correct: 2 }), card({ id: 'b', correct: 0 }), card({ id: 'c', correct: 1 })];
    for (let i = 0; i < 20; i++) {
      expect(pickNext(cards)?.id).toBe('b');
    }
  });

  it('does not repeat the previous card while another has the same score', () => {
    const cards = [card({ id: 'a' }), card({ id: 'b' })];
    for (let i = 0; i < 20; i++) {
      expect(pickNext(cards, 'a')?.id).toBe('b');
    }
  });

  it('moves to the next score level instead of repeating a lone lowest card', () => {
    const cards = [card({ id: 'a', correct: 0 }), card({ id: 'b', correct: 1 })];
    expect(pickNext(cards, 'a')?.id).toBe('b');
  });

  it('repeats the only card there is', () => {
    expect(pickNext([card({ id: 'a' })], 'a')?.id).toBe('a');
  });

  it('uses the injected random source', () => {
    const cards = [card({ id: 'a' }), card({ id: 'b' }), card({ id: 'c' })];
    expect(pickNext(cards, null, () => 0)?.id).toBe('a');
    expect(pickNext(cards, null, () => 0.99)?.id).toBe('c');
  });
});

describe('recordResult and progress', () => {
  it('counts a correct answer', () => {
    const [updated] = recordResult([card()], 'c', true);
    expect(updated).toMatchObject({ correct: 1, total: 1 });
  });

  it('counts a wrong answer in total only', () => {
    const [updated] = recordResult([card()], 'c', false);
    expect(updated).toMatchObject({ correct: 0, total: 1 });
  });

  it('leaves other cards alone and does not mutate', () => {
    const cards = [card({ id: 'a' }), card({ id: 'b' })];
    const updated = recordResult(cards, 'a', true);
    expect(updated[1]).toBe(cards[1]);
    expect(cards[0].correct).toBe(0);
  });

  it('reports how many cards were answered correctly at least once', () => {
    expect(progress([card({ id: 'a', correct: 1 }), card({ id: 'b' }), card({ id: 'c', correct: 3 })])).toEqual({
      answered: 2,
      total: 3,
    });
    expect(progress([])).toEqual({ answered: 0, total: 0 });
  });
});

describe('parseCards', () => {
  it('reads cards saved by the old version, which had no id', () => {
    const [parsed] = parseCards([
      { from: 'Hund', to: 'Dog', correct: 2, total: 3, lastReviewed: 1, fromLanguage: 'se', toLanguage: 'en' },
    ])!;
    expect(parsed).toMatchObject({ from: 'Hund', to: 'Dog', correct: 2, total: 3 });
    expect(parsed.id).toBeTruthy();
  });

  it('skips entries that are not cards', () => {
    expect(parseCards([null, 5, { from: 'x' }, card()])).toHaveLength(1);
  });

  it('rejects data that is not a list', () => {
    expect(parseCards({})).toBeNull();
    expect(parseCards('x')).toBeNull();
  });
});

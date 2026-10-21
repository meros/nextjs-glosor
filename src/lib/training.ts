import { Glossary, newId } from './glossary';

export type Direction = 'both' | 'fromTo' | 'toFrom';

export interface Card {
  id: string;
  from: string;
  to: string;
  fromLanguage: string;
  toLanguage: string;
  correct: number;
  total: number;
}

export interface Feedback {
  isCorrect: boolean;
  given: string;
  correctAnswer: string;
}

export function buildCards(glossary: Glossary, direction: Direction): Card[] {
  return glossary.items.flatMap((item) => {
    const cards: Card[] = [];
    if (direction !== 'toFrom') {
      cards.push({
        id: newId(),
        from: item.a,
        to: item.b,
        fromLanguage: glossary.fromLanguage,
        toLanguage: glossary.toLanguage,
        correct: 0,
        total: 0,
      });
    }
    if (direction !== 'fromTo') {
      cards.push({
        id: newId(),
        from: item.b,
        to: item.a,
        fromLanguage: glossary.toLanguage,
        toLanguage: glossary.fromLanguage,
        correct: 0,
        total: 0,
      });
    }
    return cards;
  });
}

/** Trims, collapses inner whitespace and normalizes Unicode so that å typed as a + ring still matches å. */
export function normalizeAnswer(text: string, caseSensitive: boolean): string {
  const cleaned = text.normalize('NFC').trim().replace(/\s+/g, ' ');
  return caseSensitive ? cleaned : cleaned.toLocaleLowerCase();
}

export function isCorrectAnswer(card: Card, input: string, caseSensitive: boolean): boolean {
  return normalizeAnswer(input, caseSensitive) === normalizeAnswer(card.to, caseSensitive);
}

/**
 * Picks the next card among those answered correctly the fewest times.
 * A card is not repeated straight away when another card is available.
 */
export function pickNext(
  cards: Card[],
  previousId: string | null = null,
  random: () => number = Math.random,
): Card | null {
  if (cards.length === 0) {
    return null;
  }
  const fewest = Math.min(...cards.map((card) => card.correct));
  let pool = cards.filter((card) => card.correct === fewest);
  if (pool.length > 1 && previousId !== null) {
    pool = pool.filter((card) => card.id !== previousId);
  }
  if (pool.length === 1 && cards.length > 1 && pool[0].id === previousId) {
    const others = cards.filter((card) => card.id !== previousId);
    const nextFewest = Math.min(...others.map((card) => card.correct));
    pool = others.filter((card) => card.correct === nextFewest);
  }
  return pool[Math.floor(random() * pool.length)];
}

export function recordResult(cards: Card[], id: string, isCorrect: boolean): Card[] {
  return cards.map((card) =>
    card.id === id ? { ...card, correct: card.correct + (isCorrect ? 1 : 0), total: card.total + 1 } : card,
  );
}

export function progress(cards: Card[]): { answered: number; total: number } {
  return { answered: cards.filter((card) => card.correct > 0).length, total: cards.length };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reads cards saved by this version and by the old version, which had no ids. */
export function parseCards(value: unknown): Card[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const cards: Card[] = [];
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      typeof entry.from !== 'string' ||
      typeof entry.to !== 'string' ||
      typeof entry.fromLanguage !== 'string' ||
      typeof entry.toLanguage !== 'string'
    ) {
      continue;
    }
    cards.push({
      id: typeof entry.id === 'string' ? entry.id : newId(),
      from: entry.from,
      to: entry.to,
      fromLanguage: entry.fromLanguage,
      toLanguage: entry.toLanguage,
      correct: typeof entry.correct === 'number' ? entry.correct : 0,
      total: typeof entry.total === 'number' ? entry.total : 0,
    });
  }
  return cards;
}

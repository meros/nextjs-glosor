import { normalizeLanguageCode } from './languages';

export interface WordPair {
  id: string;
  a: string;
  b: string;
}

export interface Glossary {
  id: string;
  name: string;
  fromLanguage: string;
  toLanguage: string;
  items: WordPair[];
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseWordPair(value: unknown): WordPair | null {
  if (!isRecord(value) || typeof value.a !== 'string' || typeof value.b !== 'string') {
    return null;
  }
  return { id: typeof value.id === 'string' ? value.id : newId(), a: value.a, b: value.b };
}

/**
 * Validates one glossary from storage or a shared link.
 * Returns null when the value cannot be a glossary, so that bad data never reaches the UI.
 */
export function parseGlossary(value: unknown): Glossary | null {
  if (!isRecord(value) || typeof value.name !== 'string' || !Array.isArray(value.items)) {
    return null;
  }
  const items = value.items.map(parseWordPair).filter((item): item is WordPair => item !== null);
  return {
    id: typeof value.id === 'string' ? value.id : newId(),
    name: value.name,
    fromLanguage: normalizeLanguageCode(typeof value.fromLanguage === 'string' ? value.fromLanguage : 'se'),
    toLanguage: normalizeLanguageCode(typeof value.toLanguage === 'string' ? value.toLanguage : 'en'),
    items,
  };
}

export function parseGlossaries(value: unknown): Glossary[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map(parseGlossary).filter((glossary): glossary is Glossary => glossary !== null);
}

export function createGlossary(name: string, fromLanguage = 'se', toLanguage = 'en'): Glossary {
  return { id: newId(), name: name.trim(), fromLanguage, toLanguage, items: [] };
}

/** True when a word pair has text on both sides. */
export function isCompletePair(pair: { a: string; b: string }): boolean {
  return pair.a.trim() !== '' && pair.b.trim() !== '';
}

/** Two glossaries with the same name, languages and words count as the same list. */
export function sameContent(left: Glossary, right: Glossary): boolean {
  return (
    left.name === right.name &&
    left.fromLanguage === right.fromLanguage &&
    left.toLanguage === right.toLanguage &&
    left.items.length === right.items.length &&
    left.items.every((item, index) => item.a === right.items[index].a && item.b === right.items[index].b)
  );
}

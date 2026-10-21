import { describe, expect, it } from 'vitest';
import { createGlossary, isCompletePair, parseGlossaries, parseGlossary, sameContent } from './glossary';
import { findLanguage, languageFlag, languageName, normalizeLanguageCode } from './languages';
import { sampleGlossaries } from './samples';

describe('parseGlossary', () => {
  it('adds ids to data saved by the old version', () => {
    const parsed = parseGlossary({
      name: 'Old',
      fromLanguage: 'se',
      toLanguage: 'en',
      items: [{ a: 'Hund', b: 'Dog' }],
    })!;
    expect(parsed.id).toBeTruthy();
    expect(parsed.items[0].id).toBeTruthy();
    expect(parsed.items[0]).toMatchObject({ a: 'Hund', b: 'Dog' });
  });

  it('keeps existing ids', () => {
    expect(parseGlossary({ id: 'g', name: 'n', items: [{ id: 'w', a: 'a', b: 'b' }] })).toMatchObject({
      id: 'g',
      items: [{ id: 'w' }],
    });
  });

  it('falls back to Swedish and English when languages are missing', () => {
    expect(parseGlossary({ name: 'n', items: [] })).toMatchObject({ fromLanguage: 'se', toLanguage: 'en' });
  });

  it('drops broken word pairs and rejects broken lists', () => {
    expect(parseGlossary({ name: 'n', items: [{ a: 1, b: 'x' }, null, { a: 'ok', b: 'ok' }] })?.items).toHaveLength(1);
    expect(parseGlossary(null)).toBeNull();
    expect(parseGlossary({ name: 'n' })).toBeNull();
    expect(parseGlossary({ items: [] })).toBeNull();
  });

  it('parseGlossaries needs an array', () => {
    expect(parseGlossaries({})).toBeNull();
    expect(parseGlossaries([null, { name: 'n', items: [] }])).toHaveLength(1);
  });
});

describe('helpers', () => {
  it('createGlossary trims the name', () => {
    expect(createGlossary('  Veckans  ')).toMatchObject({ name: 'Veckans', items: [] });
  });

  it('isCompletePair needs text on both sides', () => {
    expect(isCompletePair({ a: 'a', b: 'b' })).toBe(true);
    expect(isCompletePair({ a: ' ', b: 'b' })).toBe(false);
    expect(isCompletePair({ a: 'a', b: '' })).toBe(false);
  });

  it('sameContent ignores ids', () => {
    const a = createGlossary('x');
    const b = { ...a, id: 'other' };
    expect(sameContent(a, b)).toBe(true);
    expect(sameContent(a, { ...b, name: 'y' })).toBe(false);
    expect(sameContent(a, { ...b, items: [{ id: '1', a: 'a', b: 'b' }] })).toBe(false);
  });
});

describe('languages', () => {
  it('maps the legacy sv code to se', () => {
    expect(normalizeLanguageCode('sv')).toBe('se');
    expect(findLanguage('sv')?.name).toBe('Svenska');
  });

  it('has safe fallbacks for an unknown code', () => {
    expect(languageName('qq')).toBe('qq');
    expect(languageFlag('qq')).toBe('🏳️');
  });

  it('has unique codes', () => {
    const codes = sampleGlossaries().map((g) => g.fromLanguage);
    expect(codes.every((code) => findLanguage(code))).toBe(true);
  });
});

describe('sampleGlossaries', () => {
  it('gives a new visitor three lists with working language codes and å ä ö', () => {
    const lists = sampleGlossaries();
    expect(lists).toHaveLength(3);
    expect(lists.every((list) => findLanguage(list.fromLanguage) && findLanguage(list.toLanguage))).toBe(true);
    expect(lists[2].items.map((i) => i.a).join('')).toContain('åäö');
  });
});

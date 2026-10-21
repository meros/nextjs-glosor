import { describe, expect, it } from 'vitest';
import { Glossary } from './glossary';
import { decodeShare, encodeShare, shareUrl } from './share';

const glossary: Glossary = {
  id: 'x',
  name: 'Åäö och 日本語',
  fromLanguage: 'se',
  toLanguage: 'ja',
  items: [
    { id: '1', a: 'Hus', b: '家' },
    { id: '2', a: 'Sjö', b: '湖' },
    { id: '3', a: 'Ärlig', b: 'ehrlich' },
  ],
};

describe('share links', () => {
  it('round-trips every script', () => {
    const decoded = decodeShare(encodeShare(glossary));
    expect(decoded).toMatchObject({
      name: glossary.name,
      fromLanguage: 'se',
      toLanguage: 'ja',
      items: glossary.items.map(({ a, b }) => ({ a, b })),
    });
  });

  it('gives an imported list a new id, so it never collides with an existing list', () => {
    expect(decodeShare(encodeShare(glossary))?.id).not.toBe('x');
  });

  it('produces only URL-safe characters', () => {
    expect(encodeShare(glossary)).toMatch(/^u\.[A-Za-z0-9_-]+$/);
  });

  it('builds a full /train link', () => {
    expect(shareUrl('https://glosorna.se', glossary)).toMatch(/^https:\/\/glosorna\.se\/train\?share=u\./);
  });

  it('reads a link made by the old version (plain btoa of the JSON)', () => {
    const legacy = btoa(
      JSON.stringify({ name: 'Gammal', fromLanguage: 'se', toLanguage: 'de', items: [{ a: 'Sjö', b: 'See' }] }),
    );
    expect(decodeShare(legacy)).toMatchObject({ name: 'Gammal', items: [{ a: 'Sjö', b: 'See' }] });
  });

  it('repairs a legacy link whose + turned into a space in the query string', () => {
    const json = JSON.stringify({ name: '>>>???', fromLanguage: 'se', toLanguage: 'de', items: [{ a: 'a', b: 'b' }] });
    const encoded = btoa(json);
    expect(encoded).toContain('+');
    expect(decodeShare(encoded.replace(/\+/g, ' '))?.name).toBe('>>>???');
  });

  it('maps the old sv code to se', () => {
    const legacy = btoa(JSON.stringify({ name: 'x', fromLanguage: 'sv', toLanguage: 'sv', items: [] }));
    expect(decodeShare(legacy)).toMatchObject({ fromLanguage: 'se', toLanguage: 'se' });
  });

  it.each(['', 'not base64!!', 'u.%%%', btoa('not json'), btoa('{"name":1}'), btoa('[]')])(
    'returns null for bad input %j',
    (input) => {
      expect(decodeShare(input)).toBeNull();
    },
  );
});

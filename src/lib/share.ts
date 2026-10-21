import { Glossary, newId, parseGlossary } from './glossary';

const PREFIX = 'u.';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Encodes a glossary for the `share` query parameter. The words are stored as UTF-8, so every
 * script works. The old format used `btoa` on the raw JSON, which threw for characters above U+00FF.
 */
export function encodeShare(glossary: Glossary): string {
  const payload = {
    name: glossary.name,
    fromLanguage: glossary.fromLanguage,
    toLanguage: glossary.toLanguage,
    items: glossary.items.map(({ a, b }) => ({ a, b })),
  };
  return PREFIX + toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

/** Decodes both the current format and links created before the `u.` prefix existed. */
export function decodeShare(param: string): Glossary | null {
  try {
    let json: string;
    if (param.startsWith(PREFIX)) {
      json = new TextDecoder().decode(fromBase64Url(param.slice(PREFIX.length)));
    } else {
      // Legacy links are plain base64. `+` turns into a space in a query string, so undo that.
      json = atob(param.replace(/ /g, '+'));
    }
    const parsed = parseGlossary(JSON.parse(json));
    return parsed ? { ...parsed, id: newId() } : null;
  } catch {
    return null;
  }
}

export function shareUrl(origin: string, glossary: Glossary): string {
  return `${origin}/train?share=${encodeShare(glossary)}`;
}

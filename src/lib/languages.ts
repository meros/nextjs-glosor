export interface Language {
  code: string;
  name: string;
  flag: string;
  /** BCP 47 tag, used for the `lang` attribute of answer fields. */
  bcp47: string;
}

// The codes are stored in users' browsers and in shared links, so they must not change.
// `se` is Swedish here (not the ISO code), for that reason.
export const languages: Language[] = [
  { code: 'se', name: 'Svenska', flag: '🇸🇪', bcp47: 'sv' },
  { code: 'de', name: 'Tyska', flag: '🇩🇪', bcp47: 'de' },
  { code: 'en', name: 'Engelska', flag: '🇬🇧', bcp47: 'en' },
  { code: 'es', name: 'Spanska', flag: '🇪🇸', bcp47: 'es' },
  { code: 'fr', name: 'Franska', flag: '🇫🇷', bcp47: 'fr' },
  { code: 'it', name: 'Italienska', flag: '🇮🇹', bcp47: 'it' },
  { code: 'pt', name: 'Portugisiska', flag: '🇵🇹', bcp47: 'pt' },
  { code: 'ru', name: 'Ryska', flag: '🇷🇺', bcp47: 'ru' },
  { code: 'zh', name: 'Kinesiska', flag: '🇨🇳', bcp47: 'zh' },
  { code: 'ja', name: 'Japanska', flag: '🇯🇵', bcp47: 'ja' },
  { code: 'ko', name: 'Koreanska', flag: '🇰🇷', bcp47: 'ko' },
  { code: 'xx', name: 'Klingonska', flag: '🖖', bcp47: 'tlh' },
  { code: 'yy', name: 'Minionspråk', flag: '🍌', bcp47: 'sv' },
  { code: 'zz', name: 'Piratspråk', flag: '🏴‍☠️', bcp47: 'sv' },
];

const legacyCodes: Record<string, string> = { sv: 'se' };

/** Old data used `sv` for Swedish in one sample list. */
export function normalizeLanguageCode(code: string): string {
  return legacyCodes[code] ?? code;
}

export function findLanguage(code: string): Language | undefined {
  const normalized = normalizeLanguageCode(code);
  return languages.find((language) => language.code === normalized);
}

export function languageName(code: string): string {
  return findLanguage(code)?.name ?? code;
}

export function languageFlag(code: string): string {
  return findLanguage(code)?.flag ?? '🏳️';
}

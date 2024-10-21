interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'de', name: 'Tyska', flag: '🇩🇪' },
  { code: 'en', name: 'Engelska', flag: '🇬🇧' },
  { code: 'es', name: 'Spanska', flag: '🇪🇸' },
  { code: 'fr', name: 'Franska', flag: '🇫🇷' },
  { code: 'it', name: 'Italienska', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugisiska', flag: '🇵🇹' },
  { code: 'ru', name: 'Ryska', flag: '🇷🇺' },
  { code: 'zh', name: 'Kinesiska', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanska', flag: '🇯🇵' },
  { code: 'ko', name: 'Koreanska', flag: '🇰🇷' },
  { code: 'xx', name: 'Klingonska', flag: '🖖' },
  { code: 'yy', name: 'Minionspråk', flag: '🍌' },
  { code: 'zz', name: 'Piratspråk', flag: '🏴‍☠️' },
];

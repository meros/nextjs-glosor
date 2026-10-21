import { Glossary, newId } from './glossary';

function sample(name: string, fromLanguage: string, toLanguage: string, pairs: [string, string][]): Glossary {
  return { id: newId(), name, fromLanguage, toLanguage, items: pairs.map(([a, b]) => ({ id: newId(), a, b })) };
}

/** The lists a first-time visitor starts with. */
export function sampleGlossaries(): Glossary[] {
  return [
    sample('Easy German', 'se', 'de', [
      ['Hus', 'Haus'],
      ['Bil', 'Auto'],
    ]),
    sample('Medium English', 'se', 'en', [
      ['Hund', 'Dog'],
      ['Katt', 'Cat'],
    ]),
    sample('Svenska bokstaveringsalfabetet', 'se', 'se', [
      ['a', 'Adam'],
      ['b', 'Bertil'],
      ['c', 'Cesar'],
      ['d', 'David'],
      ['e', 'Erik'],
      ['f', 'Filip'],
      ['g', 'Gustav'],
      ['h', 'Helge'],
      ['i', 'Ivar'],
      ['j', 'Johan'],
      ['k', 'Kalle'],
      ['l', 'Ludvig'],
      ['m', 'Martin'],
      ['n', 'Niklas'],
      ['o', 'Olof'],
      ['p', 'Petter'],
      ['q', 'Qvintus'],
      ['r', 'Rudolf'],
      ['s', 'Sigurd'],
      ['t', 'Tore'],
      ['u', 'Urban'],
      ['v', 'Viktor'],
      ['w', 'Wilhelm'],
      ['x', 'Xerxes'],
      ['y', 'Yngve'],
      ['z', 'Zäta'],
      ['å', 'Åke'],
      ['ä', 'Ärlig'],
      ['ö', 'Östen'],
    ]),
  ];
}

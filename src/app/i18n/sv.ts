export const sv = {
  common: {
    edit: 'Ändra glosor',
    next: 'Nästa',
    check: 'Kontrollera',
    save: 'Spara',
    cancel: 'Avbryt',
    delete: 'Ta bort',
  },
  train: {
    title: 'Öva glosor',
    noGlossaries: 'Inga glosor att öva på.',
    translate: 'Översätt ',
    inputPlaceholder: 'Skriv ditt svar här',
    caseSensitive: 'Skiftlägeskänslig',
    editGlossaries: 'Tillbaka till redigering',
    feedback: {
      correct: 'Rätt!',
      wrong: 'Fel.',
      correctAnswer: 'Rätt svar:',
    },
    from: 'från',
    to: 'till',
  },
  edit: {
    title: 'Ändra glosor',
    startTraining: 'Börja öva',
    fromLanguage: 'Från språk',
    toLanguage: 'Till språk',
    glossaries: {
      select: 'Välj ordlista',
      new: 'Ny ordlista',
      create: 'Skapa ny ordlista',
      delete: 'Ta bort ordlista',
      rename: 'Byt namn på ordlista',
      to: 'till',
    },
    wordPairs: {
      add: 'Lägg till ordpar',
      from: 'Från',
      to: 'Till',
      delete: 'Ta bort ordpar',
    },
  },
};

export type Locale = typeof sv;

import { useState } from 'react';
import { languages } from '../constants';

interface VocabularyTestProps {
  data: {
    fromLanguage: string;
    toLanguage: string;
    fromVocabulary: string;
    userInput: string;
  };
  onHandlers: {
    onCheckAnswer: (userInput: string) => void;
    setUserInput: (userInput: string) => void;
  };
}

export default function VocabularyTest({
  data: { fromLanguage, toLanguage, fromVocabulary, userInput },
  onHandlers: { onCheckAnswer, setUserInput },
}: VocabularyTestProps) {
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const fromLanguageName = languages.find((lang) => lang.code === fromLanguage)?.name;
  const toLanguageName = languages.find((lang) => lang.code === toLanguage)?.name;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold">
        Översättning från {fromLanguageName} till {toLanguageName}
      </h3>
      <p className="text-md">
        Översätt detta ord: <strong>{fromVocabulary}</strong>
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onCheckAnswer(userInput);
        }}
        className="flex flex-col items-center gap-2"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setResult(null);
          }}
          className="border p-2 w-64"
          placeholder="Skriv ditt svar här"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Kontrollera
        </button>
      </form>
      {result === 'correct' && <p className="text-green-500 font-medium">Rätt svar!</p>}
      {result === 'incorrect' && <p className="text-red-500 font-medium">Fel svar. Försök igen.</p>}
    </div>
  );
}

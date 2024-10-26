import { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Set focus to input field when the component loads or when result resets
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [result]);

  const fromLang = languages.find((lang) => lang.code === fromLanguage);
  const toLang = languages.find((lang) => lang.code === toLanguage);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-100 rounded-md shadow-md max-w-sm">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        {fromLang?.flag} {fromLang?.name} ➔ {toLang?.flag} {toLang?.name}
      </h3>
      <p className="text-lg">
        Översätt ordet: <span className="font-bold text-blue-600">{fromVocabulary}</span>
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onCheckAnswer(userInput);
        }}
        className="flex flex-col items-center gap-3 w-full"
      >
        <input
          ref={inputRef} // Set ref on the input field for focus control
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setResult(null);
          }}
          className="border border-gray-300 rounded p-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Skriv ditt svar här"
        />
        <button type="submit" className="w-full bg-blue-500 text-white font-medium py-2 rounded hover:bg-blue-600">
          Kontrollera
        </button>
      </form>
      {result === 'correct' && <p className="text-green-600 font-medium mt-2">Rätt svar!</p>}
      {result === 'incorrect' && <p className="text-red-500 font-medium mt-2">Fel svar. Försök igen.</p>}
    </div>
  );
}

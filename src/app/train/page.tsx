'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import VocabularyTest from '../components/VocabularyTest';
import { useGlossary } from '../context/GlossaryContext';

export default function TrainPage() {
  const glossaryContext = useGlossary();

  const router = useRouter();

  const chooseRandomItem = () => {
    return glossaryContext.glossary.items[Math.floor(Math.random() * glossaryContext.glossary.items.length)];
  };

  const chooseRandomLanguage = () => {
    return Math.random() > 0.5 ? glossaryContext.glossary.fromLanguage : glossaryContext.glossary.toLanguage;
  };

  const [item, setItem] = useState(chooseRandomItem());
  const [language, setLanguage] = useState(chooseRandomLanguage());

  const [userInput, setUserInput] = useState('');

  const fromVocabulary = language === glossaryContext.glossary.fromLanguage ? item.a : item.b;
  const toVocabulary = language === glossaryContext.glossary.fromLanguage ? item.b : item.a;
  const fromLanguage =
    language === glossaryContext.glossary.fromLanguage
      ? glossaryContext.glossary.fromLanguage
      : glossaryContext.glossary.toLanguage;
  const toLanguage =
    language === glossaryContext.glossary.fromLanguage
      ? glossaryContext.glossary.toLanguage
      : glossaryContext.glossary.fromLanguage;

  const onCheckAnswer = (answer: string) => {
    if (answer === toVocabulary) {
      alert('Rätt svar!');
    } else {
      alert('Fel svar!');
    }

    setItem(chooseRandomItem());
    setLanguage(chooseRandomLanguage());
    setUserInput('');
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl ">
        <header className="text-black text-2xl p-6 font-bold py-4 w-full">Träna glosor</header>
        <VocabularyTest
          data={{ fromLanguage, toLanguage, fromVocabulary, userInput }}
          onHandlers={{
            setUserInput,
            onCheckAnswer,
          }}
        />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="flex justify-center">
          <button
            className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded hover:bg-blue-700"
            onClick={() => {
              router.push('/edit');
            }}
          >
            Ändra glosor
          </button>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import VocabularyTest from '../components/VocabularyTest';
import { useGlossary } from '../context/GlossaryContext';

export default function TrainPage() {
  const glossaryContext = useGlossary();
  const [items, setItems] = useState<
    {
      fromLanguage: string;
      toLanguage: string;
      from: string;
      to: string;
      correct: number;
      total: number;
    }[]
  >(
    glossaryContext.glossary.items.flatMap((item) => [
      {
        fromLanguage: glossaryContext.glossary.fromLanguage,
        toLanguage: glossaryContext.glossary.toLanguage,
        from: item.a,
        to: item.b,
        correct: 0,
        total: 0,
      },
      {
        fromLanguage: glossaryContext.glossary.toLanguage,
        toLanguage: glossaryContext.glossary.fromLanguage,
        from: item.b,
        to: item.a,
        correct: 0,
        total: 0,
      },
    ]),
  );

  const router = useRouter();

  const chooseRandomItemIdx = () => {
    return Math.floor(Math.random() * items.length);
  };

  const [itemIdx, setItemIdx] = useState(chooseRandomItemIdx());
  const item = useMemo(() => items[itemIdx], [itemIdx, items]);

  const [userInput, setUserInput] = useState('');

  const onCheckAnswer = (answer: string) => {
    if (answer === item.to) {
      alert('Rätt svar!');
    } else {
      alert('Fel svar!');
    }

    setItems([
      ...items.slice(0, itemIdx),
      {
        ...item,
        correct: item.correct + (answer === item.to ? 1 : 0),
        total: item.total + 1,
      },
      ...items.slice(itemIdx + 1),
    ]);
    setItemIdx(chooseRandomItemIdx());
    setUserInput('');
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl ">
        <header className="text-black text-2xl p-6 font-bold py-4 w-full">Träna glosor</header>
        <VocabularyTest
          data={{ fromVocabulary: item.from, fromLanguage: item.fromLanguage, toLanguage: item.toLanguage, userInput }}
          onHandlers={{
            setUserInput,
            onCheckAnswer,
          }}
        />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="flex justify-center">
          {items.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-500">
              {item.from} → {item.to}: {item.correct}/{item.total}
            </div>
          ))}
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

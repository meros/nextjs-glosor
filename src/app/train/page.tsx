'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import VocabularyTest from '../components/VocabularyTest';
import { useTraining } from '../context/TrainingContext';

export default function TrainPage() {
  const router = useRouter();

  const { items, updateStats } = useTraining(); // Use TrainingContext here

  const [isCaseSensitive, setIsCaseSensitive] = useState(true); // Case sensitivity toggle

  const sortedItems = useMemo(
    () =>
      items
        .map((item, idx) => {
          const elapsedTime = (Date.now() - item.lastReviewed) / 1000 / 60; // in minutes

          const timeFactor = Math.log(1 + elapsedTime); // Lower time influence
          const confidenceFactor = -item.confidence / 20; // Higher confidence influence

          const weight = confidenceFactor + timeFactor;
          return { idx, weight, difficultyFactor: confidenceFactor, timeFactor };
        })
        .sort((a, b) => b.weight - a.weight),
    [items],
  );

  const totalConfidence = useMemo(() => {
    const sumConfidence = items.reduce((sum, item) => sum + item.confidence, 0);
    return sumConfidence / items.length;
  }, [items]);

  const confidenceColor =
    totalConfidence >= 67 ? 'text-green-500' : totalConfidence >= 34 ? 'text-yellow-500' : 'text-red-500';

  const chooseRandomItemIdx = useCallback(() => {
    const topWeightedItems = sortedItems.slice(0, Math.max(1, Math.ceil(sortedItems.length * 0.2)));
    const weightsSum = topWeightedItems.reduce((sum, item) => sum + item.weight, 0);
    let randomValue = Math.random() * weightsSum;

    for (const item of topWeightedItems) {
      randomValue -= item.weight;
      if (randomValue <= 0) {
        return item.idx;
      }
    }

    return topWeightedItems[0].idx;
  }, [sortedItems]);

  const [itemIdx, setItemIdx] = useState(0);
  const item = useMemo(() => items[itemIdx], [itemIdx, items]);

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<null | { isCorrect: boolean; correctAnswer: string }>(null);
  const [countdown, setCountdown] = useState(5);

  const onCheckAnswer = () => {
    // Prepare strings for comparison
    const cleanAnswer = isCaseSensitive ? item.to.trim() : item.to.trim().toLowerCase();
    const cleanUserInput = isCaseSensitive ? userInput.trim() : userInput.trim().toLowerCase();

    const isCorrect = cleanUserInput === cleanAnswer;
    setFeedback({ isCorrect, correctAnswer: item.to });

    // Update stats in TrainingContext
    updateStats(itemIdx, isCorrect);
    setCountdown(5);
  };

  const goToNextItem = useCallback(() => {
    setItemIdx(chooseRandomItemIdx());
    setUserInput('');
    setFeedback(null);
  }, [chooseRandomItemIdx]);

  useEffect(() => {
    if (feedback && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      goToNextItem();
    }
  }, [feedback, countdown, goToNextItem]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && feedback) {
        event.preventDefault();
        goToNextItem();
      }
    };

    if (feedback) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [feedback, goToNextItem]);

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-700">Inga glosor att öva på.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <header className="text-black text-2xl p-6 font-bold py-4 w-full text-center">
          Öva glosor
          <p className={`text-lg mt-2 ${confidenceColor}`}>Total Confidence: {totalConfidence.toFixed(1)}%</p>
        </header>
        <div className="flex justify-center">
          {feedback ? (
            <div className="text-center">
              <p className={`text-xl font-semibold ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {feedback.isCorrect ? 'Rätt!' : 'Fel.'}
              </p>
              {!feedback.isCorrect && (
                <p className="text-lg text-gray-700 mt-2">
                  Rätt svar: <span className="font-bold">{feedback.correctAnswer}</span>
                </p>
              )}
              <button
                className="bg-blue-500 text-white font-medium py-2 px-4 rounded mt-4 hover:bg-blue-700"
                onClick={goToNextItem}
              >
                Nästa ({countdown})
              </button>
            </div>
          ) : (
            <VocabularyTest
              data={{
                fromVocabulary: item.from,
                fromLanguage: item.fromLanguage,
                toLanguage: item.toLanguage,
                userInput,
              }}
              onHandlers={{
                setUserInput,
                onCheckAnswer,
              }}
            />
          )}
        </div>
        <div className="text-center mt-4">
          <button
            className={`py-2 px-4 font-medium rounded ${
              isCaseSensitive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'
            }`}
            onClick={() => setIsCaseSensitive((prev) => !prev)}
          >
            {isCaseSensitive ? 'Case-Sensitive: On' : 'Case-Sensitive: Off'}
          </button>
        </div>
      </div>
      {sortedItems.map((item, idx) => (
        <div key={idx}>
          <p>
            {items[item.idx].from}: {item.weight}, {item.difficultyFactor}, {item.timeFactor}
          </p>
        </div>
      ))}
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

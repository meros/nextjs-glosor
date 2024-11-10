'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import VocabularyTest from '../components/VocabularyTest';
import { useTraining } from '../context/TrainingContext';

export default function TrainPage() {
  const router = useRouter();

  const {
    currentItem,
    checkAnswer,
    countdownToNextItem: countdown,
    isCaseSensitive,
    setIsCaseSensitive,
    goToNextItem,
    checkAnswerFeedback: feedback,
  } = useTraining();

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

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-700">Inga glosor att öva på.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <header className="text-black text-2xl p-6 font-bold py-4 w-full text-center">Öva glosor</header>
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
                fromVocabulary: currentItem.from,
                fromLanguage: currentItem.fromLanguage,
                toLanguage: currentItem.toLanguage,
              }}
              onHandlers={{
                onCheckAnswer: checkAnswer,
              }}
            />
          )}
        </div>
        <div className="text-center mt-4">
          <button
            className={`py-2 px-4 font-medium rounded ${
              isCaseSensitive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'
            }`}
            onClick={() => setIsCaseSensitive(!isCaseSensitive)}
          >
            {isCaseSensitive ? 'Case-Sensitive: On' : 'Case-Sensitive: Off'}
          </button>
        </div>
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

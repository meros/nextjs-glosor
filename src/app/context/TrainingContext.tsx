import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface TrainingItem {
  from: string;
  to: string;
  correct: number;
  total: number;
  lastReviewed: number;
  fromLanguage: string;
  toLanguage: string;
}

interface TrainingContextValue {
  items: TrainingItem[];
  setItems: React.Dispatch<React.SetStateAction<TrainingItem[]>>;
  currentItem: TrainingItem | null;
  isCaseSensitive: boolean;
  checkAnswer: (userInput: string) => void;
  checkAnswerFeedback: { isCorrect: boolean; correctAnswer: string } | null;
  countdownToNextItem: number;
  goToNextItem: () => void;
  setIsCaseSensitive: (isCaseSensitive: boolean) => void;
  direction: 'both' | 'forward' | 'backward';
  setDirection: (direction: 'both' | 'forward' | 'backward') => void;
}

const TrainingContext = createContext<TrainingContextValue | undefined>(undefined);

export const useTraining = (): TrainingContextValue => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

interface TrainingProviderProps {
  children: ReactNode;
}

export const TrainingProvider = ({ children }: TrainingProviderProps) => {
  const [items, setItems] = useLocalStorage<TrainingItem[]>('trainingItems', []);
  const [checkAnswerFeedback, setCheckAnswerFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(
    null,
  );
  const [countdownToNextItem, setCountdownToNextItem] = useState(5);
  const [isCaseSensitive, setIsCaseSensitive] = useLocalStorage<boolean>('isCaseSensitive', true);
  const [currentItemIdx, setCurrentItemIdx] = useState<number | undefined>(undefined);
  const [direction, setDirection] = useLocalStorage<'both' | 'forward' | 'backward'>('direction', 'both');

  const currentItem = useMemo(
    () => (currentItemIdx !== undefined ? items[currentItemIdx] : null),
    [items, currentItemIdx],
  );

  const sortedItems = useMemo(
    () => items.map((item, idx) => ({ idx, weight: item.correct })).sort((a, b) => b.weight - a.weight),
    [items],
  );

  const chooseRandomItemIdx = useCallback(() => {
    if (sortedItems.length === 0) {
      return undefined;
    }

    const lowestWeight = sortedItems[sortedItems.length - 1].weight;
    const lowestWeightItems = sortedItems.filter((item) => item.weight === lowestWeight);
    const randomIdx = Math.floor(Math.random() * lowestWeightItems.length);
    return lowestWeightItems[randomIdx].idx;
  }, [sortedItems]);

  useEffect(() => {
    setCurrentItemIdx(chooseRandomItemIdx());
  }, [items, chooseRandomItemIdx]);

  const updateStats = useCallback(
    (item: TrainingItem, isCorrect: boolean) => {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i === item
            ? {
                ...item,
                correct: item.correct + (isCorrect ? 1 : 0),
                total: item.total + 1,
                lastReviewed: Date.now(),
              }
            : i,
        ),
      );
    },
    [setItems],
  );

  const checkAnswer = useCallback(
    (userInput: string) => {
      if (!currentItem) {
        return;
      }

      const cleanAnswer = isCaseSensitive ? currentItem.to.trim() : currentItem.to.trim().toLowerCase();
      const cleanUserInput = isCaseSensitive ? userInput.trim() : userInput.trim().toLowerCase();

      const isCorrect = cleanUserInput === cleanAnswer;
      setCheckAnswerFeedback({ isCorrect, correctAnswer: currentItem.to });
      updateStats(currentItem, isCorrect);
      setCountdownToNextItem(5);
    },
    [currentItem, isCaseSensitive, updateStats],
  );

  const goToNextItem = useCallback(() => {
    setCurrentItemIdx(chooseRandomItemIdx());
    setCheckAnswerFeedback(null);
  }, [chooseRandomItemIdx]);

  useEffect(() => {
    if (checkAnswerFeedback && countdownToNextItem > 0) {
      const timer = setTimeout(() => setCountdownToNextItem(countdownToNextItem - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdownToNextItem === 0) {
      goToNextItem();
    }
  }, [checkAnswerFeedback, countdownToNextItem, goToNextItem]);

  return (
    <TrainingContext.Provider
      value={{
        items,
        setItems,
        currentItem,
        isCaseSensitive,
        checkAnswer,
        checkAnswerFeedback,
        countdownToNextItem,
        goToNextItem,
        setIsCaseSensitive,
        direction,
        setDirection,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

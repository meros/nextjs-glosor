// TrainingContext.tsx

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface TrainingItem {
  from: string;
  to: string;
  correct: number;
  total: number;
  lastReviewed: number;
  confidence: number;
  fromLanguage: string;
  toLanguage: string;
}

interface TrainingContextProps {
  items: TrainingItem[];
  updateStats: (idx: number, isCorrect: boolean) => void;
  resetStats: () => void;
}

const TrainingContext = createContext<TrainingContextProps | undefined>(undefined);

export const useTraining = (): TrainingContextProps => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

interface TrainingProviderProps {
  children: ReactNode;
  initialItems: TrainingItem[];
}

export const TrainingProvider = ({ children, initialItems }: TrainingProviderProps) => {
  const [items, setItems] = useState<TrainingItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const updateStats = useCallback((idx: number, isCorrect: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === idx
          ? {
              ...item,
              correct: item.correct + (isCorrect ? 1 : 0),
              total: item.total + 1,
              lastReviewed: Date.now(),
              confidence: item.confidence + (isCorrect ? 1 : -1),
            }
          : item,
      ),
    );
  }, []);

  const resetStats = useCallback(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        correct: 0,
        total: 0,
        lastReviewed: Date.now(),
        confidence: 0,
      })),
    );
  }, []);

  return <TrainingContext.Provider value={{ items, updateStats, resetStats }}>{children}</TrainingContext.Provider>;
};

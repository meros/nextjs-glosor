'use client';

import { Button, Stack, Text } from '@mantine/core';
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
    return <Text size="xl">Inga glosor att öva på.</Text>;
  }

  return (
    <Stack>
      <Text size="xl">Öva glosor</Text>
      {feedback ? (
        <Stack align="center">
          <Text size="xl" c={feedback.isCorrect ? 'green' : 'red'}>
            {feedback.isCorrect ? 'Rätt!' : 'Fel.'}
          </Text>
          {!feedback.isCorrect && (
            <Text size="lg">
              Rätt svar: <strong>{feedback.correctAnswer}</strong>
            </Text>
          )}
          <Button onClick={goToNextItem} fullWidth>
            Nästa ({countdown})
          </Button>
        </Stack>
      ) : (
        <VocabularyTest
          data={{
            fromVocabulary: currentItem.from,
            fromLanguage: currentItem.fromLanguage,
            toLanguage: currentItem.toLanguage,
          }}
          onHandlers={{ onCheckAnswer: checkAnswer }}
        />
      )}

      <Button
        variant={isCaseSensitive ? 'filled' : 'outline'}
        color={isCaseSensitive ? 'green' : 'gray'}
        onClick={() => setIsCaseSensitive(!isCaseSensitive)}
      >
        {isCaseSensitive ? 'Case-Sensitive: On' : 'Case-Sensitive: Off'}
      </Button>

      <Button onClick={() => router.push('/edit')}>Ändra glosor</Button>
    </Stack>
  );
}

'use client';

import { Button, Stack, Text, Checkbox } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import VocabularyTest from '../components/VocabularyTest';
import { useTraining } from '../context/TrainingContext';
import { useLocale } from '../context/LocaleContext';
import PageContent from '../components/PageContent';
import { Glossary } from '../components/GlossaryEditor';

function TrainSearchParamLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setItems } = useTraining();
  useEffect(() => {
    const sharedData = searchParams.get('share');
    if (sharedData) {
      try {
        const decodedData = JSON.parse(atob(sharedData)) as Glossary;
        const trainingItems = decodedData.items.flatMap((item) => [
          {
            from: item.a,
            to: item.b,
            correct: 0,
            total: 0,
            lastReviewed: Date.now(),
            fromLanguage: decodedData.fromLanguage,
            toLanguage: decodedData.toLanguage,
          },
          {
            from: item.b,
            to: item.a,
            correct: 0,
            total: 0,
            lastReviewed: Date.now(),
            fromLanguage: decodedData.toLanguage,
            toLanguage: decodedData.fromLanguage,
          },
        ]);
        setItems(trainingItems);
        router.replace('/train'); // Remove share parameter from URL
      } catch (error) {
        console.error('Failed to parse shared data:', error);
      }
    }
  }, []);

  return null;
}

export default function TrainPage() {
  const router = useRouter();
  const locale = useLocale();
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
        event.preventDefault(); // Prevent default Enter behavior
        goToNextItem();
      }
    };

    if (feedback) {
      window.addEventListener('keydown', handleKeyPress, true); // Add capture phase
      return () => window.removeEventListener('keydown', handleKeyPress, true);
    }
  }, [feedback, goToNextItem]);

  if (!currentItem) {
    return (
      <PageContent>
        <Text size="xl">{locale.train.noGlossaries}</Text>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Suspense>
        <TrainSearchParamLoader />
      </Suspense>
      <Stack>
        <Text size="xl">{locale.train.title}</Text>
        {feedback ? (
          <Stack align="center">
            <Text size="xl" c={feedback.isCorrect ? 'green' : 'red'}>
              {feedback.isCorrect ? locale.train.feedback.correct : locale.train.feedback.wrong}
            </Text>
            {!feedback.isCorrect && (
              <Text size="lg">
                {locale.train.feedback.correctAnswer} <strong>{feedback.correctAnswer}</strong>
              </Text>
            )}
            <Button onClick={goToNextItem} fullWidth>
              {locale.common.next} ({countdown})
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

        <Checkbox
          label={locale.train.caseSensitive}
          checked={isCaseSensitive}
          onChange={() => setIsCaseSensitive(!isCaseSensitive)}
        />

        <Button onClick={() => router.push('/edit')}>{locale.train.editGlossaries}</Button>
      </Stack>
    </PageContent>
  );
}

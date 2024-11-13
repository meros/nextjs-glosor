import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { languages } from '../constants';
import { useLocale } from '../hooks/useLocale';

interface VocabularyTestProps {
  data: {
    fromLanguage: string;
    toLanguage: string;
    fromVocabulary: string;
  };
  onHandlers: {
    onCheckAnswer: (userInput: string) => void;
  };
}

export default function VocabularyTest({ data, onHandlers }: VocabularyTestProps) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fromLang = languages.find((lang) => lang.code === data.fromLanguage);
  const toLang = languages.find((lang) => lang.code === data.toLanguage);

  const checkAnswer = useCallback(() => {
    onHandlers.onCheckAnswer(inputRef.current?.value || '');
  }, [onHandlers]);

  return (
    <Stack>
      <Text size="xl" flex={1}>
        {locale.train.translate} <strong>{data.fromVocabulary}</strong> {locale.train.from}
        <strong>{fromLang?.flag}</strong> {locale.train.to} <strong>{toLang?.flag}</strong>
      </Text>
      <Group>
        <TextInput
          flex={1}
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              checkAnswer();
            }
          }}
          placeholder={locale.train.inputPlaceholder}
        />
        <Button onClick={checkAnswer}>{locale.common.check}</Button>
      </Group>
    </Stack>
  );
}

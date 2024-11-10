import { Button, Flex, Stack, Text, TextInput } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { languages } from '../constants';

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

export default function VocabularyTest({
  data: { fromLanguage, toLanguage, fromVocabulary },
  onHandlers: { onCheckAnswer },
}: VocabularyTestProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fromLang = languages.find((lang) => lang.code === fromLanguage);
  const toLang = languages.find((lang) => lang.code === toLanguage);

  const checkAnswer = useCallback(() => {
    onCheckAnswer(inputRef.current?.value || '');
  }, [onCheckAnswer]);

  return (
    <Stack>
      <Text>
        {fromLang?.flag} {fromLang?.name} ➔ {toLang?.flag} {toLang?.name}
      </Text>

      <Text>
        Översätt ordet: <strong>{fromVocabulary}</strong>
      </Text>

      <TextInput
        ref={inputRef}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            checkAnswer();
          }
        }}
        placeholder="Skriv ditt svar här"
      />
      <Button fullWidth onClick={checkAnswer}>
        Kontrollera
      </Button>
    </Stack>
  );
}

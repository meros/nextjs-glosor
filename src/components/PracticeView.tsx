'use client';

import { Alert, Button, Group, Paper, Progress, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { FormEvent, useEffect, useState } from 'react';
import { sv } from '@/i18n/sv';
import { findLanguage, languageName } from '@/lib/languages';
import { usePractice } from '@/state/PracticeProvider';

/** A correct answer moves on by itself after this long. The Next button and Enter skip the wait. */
export const AUTO_ADVANCE_MS = 1500;

export default function PracticeView() {
  const { state, card, progress, submit, next, setCaseSensitive } = usePractice();
  const [answer, setAnswer] = useState('');
  const feedback = state.feedback;

  useEffect(() => {
    if (!feedback?.isCorrect) {
      return;
    }
    const timer = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [feedback, next]);

  if (!card) {
    return null;
  }

  const toName = languageName(card.toLanguage);
  const percent = progress.total === 0 ? 0 : Math.round((progress.answered / progress.total) * 100);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(answer);
    setAnswer('');
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>{sv.train.title}</Title>
        {state.title && (
          <Text c="dimmed" size="sm">
            {sv.train.practicing(state.title)}
          </Text>
        )}
      </div>

      <div>
        <Progress value={percent} size="md" aria-hidden="true" />
        <Text size="sm" c="dimmed" mt={4}>
          {sv.train.progress(progress.answered, progress.total)}
        </Text>
      </div>

      <Paper withBorder p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed">
              {`${findLanguage(card.fromLanguage)?.flag ?? ''} ${languageName(card.fromLanguage)} → ${findLanguage(card.toLanguage)?.flag ?? ''} ${toName}`}
            </Text>
            <Text
              component="p"
              fw={700}
              m={0}
              lang={findLanguage(card.fromLanguage)?.bcp47}
              style={{ fontSize: 'clamp(1.75rem, 1.2rem + 3vw, 2.75rem)', lineHeight: 1.15, overflowWrap: 'anywhere' }}
            >
              {card.from}
            </Text>
          </div>

          {feedback ? (
            <Stack gap="sm">
              <Alert
                role="status"
                color={feedback.isCorrect ? 'teal' : 'red'}
                icon={feedback.isCorrect ? <IconCheck size={20} /> : <IconX size={20} />}
                title={feedback.isCorrect ? sv.train.correct : sv.train.wrong}
              >
                {!feedback.isCorrect && (
                  <Stack gap={4}>
                    <Text>
                      {sv.train.yourAnswer}: <strong>{feedback.given || sv.train.noAnswer}</strong>
                    </Text>
                    <Text>
                      {sv.train.correctAnswer}:{' '}
                      <strong lang={findLanguage(card.toLanguage)?.bcp47}>{feedback.correctAnswer}</strong>
                    </Text>
                  </Stack>
                )}
              </Alert>
              <Button size="lg" fullWidth autoFocus onClick={next}>
                {sv.train.next}
              </Button>
            </Stack>
          ) : (
            <form onSubmit={onSubmit}>
              <Stack gap="sm">
                <TextInput
                  size="lg"
                  aria-label={`${sv.train.answerLabel} (${toName.toLowerCase()})`}
                  placeholder={sv.train.answerPlaceholder}
                  value={answer}
                  onChange={(event) => setAnswer(event.currentTarget.value)}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  lang={findLanguage(card.toLanguage)?.bcp47}
                />
                <Button type="submit" size="lg" fullWidth>
                  {sv.train.check}
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>

      <Group justify="space-between">
        <Switch
          label={sv.train.caseSensitive}
          description={sv.train.caseSensitiveHint}
          checked={state.caseSensitive}
          onChange={(event) => setCaseSensitive(event.currentTarget.checked)}
        />
      </Group>
    </Stack>
  );
}

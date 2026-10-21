'use client';

import { ActionIcon, Button, Paper, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { FormEvent, useRef, useState } from 'react';
import { sv } from '@/i18n/sv';
import { Glossary } from '@/lib/glossary';
import { GlossaryAction } from '@/lib/glossaryReducer';
import { languageName, languages } from '@/lib/languages';
import classes from './GlossaryEditor.module.css';

interface GlossaryEditorProps {
  glossary: Glossary;
  dispatch: (action: GlossaryAction) => void;
}

const languageOptions = languages.map((language) => ({
  value: language.code,
  label: `${language.flag} ${language.name}`,
}));

export default function GlossaryEditor({ glossary, dispatch }: GlossaryEditorProps) {
  const fromName = languageName(glossary.fromLanguage);
  const toName = languageName(glossary.toLanguage);

  const [draft, setDraft] = useState({ a: '', b: '' });
  const aRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLInputElement>(null);

  const addWord = (event: FormEvent) => {
    event.preventDefault();
    if (draft.a.trim() === '') {
      aRef.current?.focus();
      return;
    }
    if (draft.b.trim() === '') {
      bRef.current?.focus();
      return;
    }
    dispatch({ type: 'addWord', id: glossary.id, a: draft.a, b: draft.b });
    setDraft({ a: '', b: '' });
    aRef.current?.focus();
  };

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
        <Select
          label={sv.lists.fromLanguage}
          value={glossary.fromLanguage}
          data={languageOptions}
          onChange={(value) => value && dispatch({ type: 'setLanguages', id: glossary.id, fromLanguage: value })}
        />
        <Select
          label={sv.lists.toLanguage}
          value={glossary.toLanguage}
          data={languageOptions}
          onChange={(value) => value && dispatch({ type: 'setLanguages', id: glossary.id, toLanguage: value })}
        />
      </SimpleGrid>

      <Paper withBorder p={{ base: 'sm', sm: 'md' }}>
        <Stack gap="sm">
          <Text fw={600} component="h2" size="sm" c="dimmed">
            {sv.lists.wordCount(glossary.items.length)}
          </Text>

          {glossary.items.length === 0 ? (
            <Text c="dimmed">{sv.lists.noWords}</Text>
          ) : (
            <ul className={classes.list} aria-label={sv.lists.wordCount(glossary.items.length)}>
              {glossary.items.map((item, index) => (
                <li key={item.id} className={classes.row}>
                  <TextInput
                    aria-label={sv.words.row(index + 1, 'vänster', fromName)}
                    value={item.a}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) =>
                      dispatch({
                        type: 'updateWord',
                        id: glossary.id,
                        wordId: item.id,
                        field: 'a',
                        value: event.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    aria-label={sv.words.row(index + 1, 'höger', toName)}
                    value={item.b}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) =>
                      dispatch({
                        type: 'updateWord',
                        id: glossary.id,
                        wordId: item.id,
                        field: 'b',
                        value: event.currentTarget.value,
                      })
                    }
                  />
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size={44}
                    aria-label={sv.words.remove(index + 1)}
                    onClick={() => dispatch({ type: 'removeWord', id: glossary.id, wordId: item.id })}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </li>
              ))}
            </ul>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        p={{ base: 'sm', sm: 'md' }}
        component="form"
        onSubmit={addWord}
        aria-label={sv.words.addHeading}
      >
        <Stack gap="sm">
          <Text fw={600} component="h2" size="sm" c="dimmed">
            {sv.words.addHeading}
          </Text>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput
              ref={aRef}
              label={sv.words.newIn(fromName)}
              value={draft.a}
              enterKeyHint="next"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => setDraft({ ...draft, a: event.currentTarget.value })}
            />
            <TextInput
              ref={bRef}
              label={sv.words.newIn(toName)}
              value={draft.b}
              enterKeyHint="done"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => setDraft({ ...draft, b: event.currentTarget.value })}
            />
          </SimpleGrid>
          <Button type="submit" variant="default" leftSection={<IconPlus size={18} />}>
            {sv.words.add}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

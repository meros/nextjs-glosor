'use client';

import { Button, Paper, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';
import { sv } from '@/i18n/sv';
import { Glossary } from '@/lib/glossary';
import { languageFlag } from '@/lib/languages';
import { Direction } from '@/lib/training';

interface PracticeBarProps {
  glossary: Glossary;
  onStart: (direction: Direction) => void;
}

export default function PracticeBar({ glossary, onStart }: PracticeBarProps) {
  const [direction, setDirection] = useState<Direction>('both');
  const from = languageFlag(glossary.fromLanguage);
  const to = languageFlag(glossary.toLanguage);
  const empty = glossary.items.length === 0;

  return (
    <Paper withBorder p="sm">
      <Stack gap="xs">
        <SegmentedControl
          fullWidth
          aria-label={sv.practice.direction}
          value={direction}
          onChange={(value) => setDirection(value as Direction)}
          data={[
            { value: 'both', label: sv.practice.both },
            { value: 'fromTo', label: `${from} → ${to}` },
            { value: 'toFrom', label: `${to} → ${from}` },
          ]}
        />
        <Button
          size="lg"
          fullWidth
          disabled={empty}
          leftSection={<IconPlayerPlay size={20} />}
          onClick={() => onStart(direction)}
        >
          {sv.practice.start}
        </Button>
        {empty && (
          <Text size="sm" c="dimmed" ta="center">
            {sv.practice.needWords}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

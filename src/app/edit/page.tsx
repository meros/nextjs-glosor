'use client';

import { Skeleton, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import GlossaryEditor from '@/components/GlossaryEditor';
import GlossaryPicker from '@/components/GlossaryPicker';
import PageContainer from '@/components/PageContainer';
import PracticeBar from '@/components/PracticeBar';
import { sv } from '@/i18n/sv';
import { Direction } from '@/lib/training';
import { useGlossaries } from '@/state/GlossaryProvider';
import { usePractice } from '@/state/PracticeProvider';

export default function EditPage() {
  const router = useRouter();
  const { ready, glossaries, selected, dispatch } = useGlossaries();
  const practice = usePractice();

  const start = (direction: Direction) => {
    if (!selected) {
      return;
    }
    practice.start(selected, direction);
    router.push('/train');
  };

  if (!ready) {
    return (
      <PageContainer>
        <Stack aria-busy="true">
          <Skeleton height={36} width="60%" />
          <Skeleton height={42} />
          <Skeleton height={240} />
        </Stack>
      </PageContainer>
    );
  }

  if (glossaries.length === 0) {
    return (
      <PageContainer>
        <Stack align="center" gap="sm" py="xl" ta="center">
          <Title order={1}>{sv.lists.emptyTitle}</Title>
          <Text c="dimmed">{sv.lists.emptyBody}</Text>
          <GlossaryPicker glossaries={glossaries} selected={selected} dispatch={dispatch} />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack gap="md">
        <Title order={1}>{sv.lists.title}</Title>
        <GlossaryPicker glossaries={glossaries} selected={selected} dispatch={dispatch} />
        {selected && (
          <>
            <PracticeBar key={`bar-${selected.id}`} glossary={selected} onStart={start} />
            <GlossaryEditor key={selected.id} glossary={selected} dispatch={dispatch} />
          </>
        )}
      </Stack>
    </PageContainer>
  );
}

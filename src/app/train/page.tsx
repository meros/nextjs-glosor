'use client';

import { Button, Skeleton, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import PageContainer from '@/components/PageContainer';
import PracticeView from '@/components/PracticeView';
import { sv } from '@/i18n/sv';
import { decodeShare } from '@/lib/share';
import { useGlossaries } from '@/state/GlossaryProvider';
import { usePractice } from '@/state/PracticeProvider';

/** Imports a list from a `?share=` link, starts practice on it and removes the parameter from the address. */
function SharedListLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const glossaries = useGlossaries();
  const practice = usePractice();
  const handled = useRef(false);
  const param = searchParams.get('share');
  const ready = glossaries.ready && practice.ready;

  useEffect(() => {
    // The providers read saved data in their own effects. Importing earlier would be overwritten.
    if (!param || !ready || handled.current) {
      return;
    }
    handled.current = true;
    const glossary = decodeShare(param);
    if (glossary) {
      glossaries.dispatch({ type: 'import', glossary });
      practice.start(glossary, 'both');
      notifications.show({ message: sv.train.sharedImported(glossary.name), color: 'teal' });
    } else {
      notifications.show({ message: sv.train.sharedInvalid, color: 'red' });
    }
    router.replace('/train');
  }, [param, ready, glossaries, practice, router]);

  return null;
}

export default function TrainPage() {
  const { ready, card } = usePractice();

  return (
    <PageContainer>
      <Suspense>
        <SharedListLoader />
      </Suspense>
      {!ready ? (
        <Stack aria-busy="true">
          <Skeleton height={36} width="40%" />
          <Skeleton height={220} />
        </Stack>
      ) : card ? (
        <PracticeView />
      ) : (
        <Stack align="center" gap="sm" py="xl" ta="center">
          <Title order={1}>{sv.train.emptyTitle}</Title>
          <Text c="dimmed">{sv.train.emptyBody}</Text>
          <Button component={Link} href="/edit">
            {sv.train.toLists}
          </Button>
        </Stack>
      )}
    </PageContainer>
  );
}

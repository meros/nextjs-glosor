'use client';

import { Button, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { sv } from '@/i18n/sv';

export default function NotFound() {
  return (
    <PageContainer>
      <Stack align="center" gap="sm" py="xl" ta="center">
        <Title order={1}>{sv.notFound.title}</Title>
        <Text c="dimmed">{sv.notFound.body}</Text>
        <Button component={Link} href="/edit">
          {sv.notFound.back}
        </Button>
      </Stack>
    </PageContainer>
  );
}

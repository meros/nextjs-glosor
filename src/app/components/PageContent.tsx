import { Card, Container } from '@mantine/core';
import { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
}

export default function PageContent({ children }: PageContentProps) {
  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" withBorder padding="xl" radius="md">
        {children}
      </Card>
    </Container>
  );
}

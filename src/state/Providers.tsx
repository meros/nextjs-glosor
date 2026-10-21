'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';
import { theme } from '@/theme';
import { GlossaryProvider } from './GlossaryProvider';
import { PracticeProvider } from './PracticeProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="bottom-center" containerWidth={420} limit={2} />
      <GlossaryProvider>
        <PracticeProvider>{children}</PracticeProvider>
      </GlossaryProvider>
    </MantineProvider>
  );
}

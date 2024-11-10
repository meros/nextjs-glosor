'use client';

import '@mantine/core/styles.css';

import { GlossaryProvider } from './context/GlossaryContext';
import { TrainingProvider } from './context/TrainingContext';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({});

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MantineProvider theme={theme}>
      <GlossaryProvider>
        <TrainingProvider>{children}</TrainingProvider>
      </GlossaryProvider>
    </MantineProvider>
  );
}

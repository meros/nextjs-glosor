'use client';

import { GlossaryProvider } from './context/GlossaryContext';
import { TrainingProvider } from './context/TrainingContext';
import './globals.css';

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GlossaryProvider>
      <TrainingProvider>{children}</TrainingProvider>
    </GlossaryProvider>
  );
}

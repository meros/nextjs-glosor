'use client';

import { GlossaryProvider } from './context/GlossaryContext';
import './globals.css';

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GlossaryProvider>{children}</GlossaryProvider>;
}

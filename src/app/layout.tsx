import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import AppHeader from '@/components/AppHeader';
import { sv } from '@/i18n/sv';
import Providers from '@/state/Providers';

export const metadata: Metadata = {
  title: { default: 'Glosorna.se', template: '%s | Glosorna.se' },
  description: sv.metaDescription,
  applicationName: 'Glosorna',
  icons: {
    icon: [{ url: '/favicon-32x32.jpg', type: 'image/jpeg', sizes: '32x32' }],
    apple: [{ url: '/favicon-192x192.jpg', sizes: '192x192' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#242424' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sv" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {sv.nav.skip}
        </a>
        <Providers>
          <AppHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </Providers>
        <GoogleAnalytics gaId="G-SZ2CB4C0EF" />
      </body>
    </html>
  );
}

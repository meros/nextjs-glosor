import { GoogleAnalytics } from '@next/third-parties/google';
import { Metadata } from 'next';
import Providers from './providers';
import { ColorSchemeScript } from '@mantine/core';

export const metadata = {
  title: 'Glosorna.se',
  description: 'En sida för att öva på glosor',
} satisfies Metadata;

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-SZ2CB4C0EF" />
    </html>
  );
}

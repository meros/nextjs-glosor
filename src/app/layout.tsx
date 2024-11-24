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
        <link rel="icon" type="image/jpg" href="/favicon-32x32.jpg" />
        <link rel="apple-touch-icon" sizes="48x48" href="/favicon-48x48.jpg" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicon-72x72.jpg" />
        <link rel="apple-touch-icon" sizes="96x96" href="/favicon-96x96.jpg" />
        <link rel="apple-touch-icon" sizes="256x256" href="/favicon-256x256.jpg" />
        <link rel="apple-touch-icon" sizes="384x384" href="/favicon-384x384.jpg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon-512x512.jpg" />
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-SZ2CB4C0EF" />
    </html>
  );
}

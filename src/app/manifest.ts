import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Glosorna',
    short_name: 'Glosorna',
    description: 'Öva på glosor. Skriv in dina ord och öva tills du kan dem.',
    lang: 'sv',
    start_url: '/edit',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0c8599',
    icons: [
      { src: '/favicon-192x192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { src: '/favicon-512x512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
  };
}

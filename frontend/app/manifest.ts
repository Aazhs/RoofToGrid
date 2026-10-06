import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoofToGrid — Rooftop Solar Planning',
    short_name: 'RoofToGrid',
    description: 'Independent rooftop solar planning and quote auditing for Indian homeowners.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#1c1b1b',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

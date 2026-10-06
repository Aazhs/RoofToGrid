import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rooftogrid.in';

export default function robots(): MetadataRoute.Robots {
  const excludedRoutes = ['/api/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: excludedRoutes,
      },
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: excludedRoutes,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

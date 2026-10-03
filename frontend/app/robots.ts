import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rooftogrid.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/onboarding', '/bills', '/roof', '/sizing', '/quotes', '/projects', '/documents', '/profile'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

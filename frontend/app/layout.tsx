import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { Analytics } from '@/components/analytics/Analytics';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rooftogrid.in';

export const metadata: Metadata = {
  title: {
    default: 'Rooftop Solar Calculator & Quote Comparison India — RoofToGrid',
    template: '%s · RoofToGrid',
  },
  description:
    'Estimate rooftop solar size, PM Surya Ghar subsidy, cost and payback. Compare installer quotes fairly and track installation milestones with RoofToGrid.',
  applicationName: 'RoofToGrid',
  keywords: [
    'rooftop solar', 'solar panel', 'solar calculator', 'India solar', 'PM Surya Ghar',
    'solar subsidy', 'solar quote comparison', 'solar installer', 'solar planning',
    'kWp calculator', 'net metering', 'solar savings', 'rooftop solar India',
    'solar panel cost India', 'solar payback calculator', 'DISCOM application',
  ],
  authors: [{ name: 'RoofToGrid Technologies' }],
  creator: 'RoofToGrid Technologies',
  publisher: 'RoofToGrid Technologies',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Rooftop Solar Calculator & Quote Comparison India — RoofToGrid',
    description: 'Estimate solar size, subsidy, cost and payback. Audit installer quotes and track your rooftop project.',
    type: 'website',
    url: BASE_URL,
    siteName: 'RoofToGrid',
    locale: 'en_IN',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'RoofToGrid rooftop solar calculator and quote comparison for India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rooftop Solar Calculator & Quote Comparison India — RoofToGrid',
    description: 'Estimate solar size, subsidy, cost and payback. Audit installer quotes and track your rooftop project.',
    creator: '@rooftogrid',
    images: [`${BASE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    // Add your verification tokens here
    // google: 'your-google-verification-token',
  },
  category: 'technology',
};

/** JSON-LD structured data for rich Google Search results */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'RoofToGrid Technologies',
      url: BASE_URL,
      logo: `${BASE_URL}/icon.png`,
      description: 'Independent rooftop solar planning and quote auditing for Indian homeowners.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'aarsh@rooftogrid.in',
        contactType: 'customer service',
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: 'RoofToGrid',
      url: BASE_URL,
      inLanguage: 'en-IN',
      description: 'Independent rooftop solar sizing, subsidy estimation, installer quote auditing and project tracking for Indian homeowners.',
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/#application`,
      name: 'RoofToGrid',
      url: BASE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      inLanguage: 'en-IN',
      isAccessibleForFree: true,
      audience: {
        '@type': 'Audience',
        audienceType: 'Indian residential electricity consumers considering rooftop solar',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        name: 'Guided planning demo',
      },
      featureList: [
        'Solar sizing calculator',
        'PM Surya Ghar subsidy calculator',
        'Quote comparison with value scoring',
        'Project milestone tracking',
        'Performance monitoring',
        'Private document vault',
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="RoofToGrid information for AI assistants" />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
          <CookieConsent />
          <Analytics />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}

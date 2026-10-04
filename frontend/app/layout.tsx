import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/ui/CookieConsent';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rooftogrid.in';

export const metadata: Metadata = {
  title: {
    default: 'RoofToGrid — India\'s Smartest Rooftop Solar Planning Platform',
    template: '%s · RoofToGrid',
  },
  description:
    'Plan your rooftop solar with clear numbers. Compare installer quotes fairly, track your project end-to-end, and monitor system performance — all in one platform built for Indian homeowners.',
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RoofToGrid — India\'s Smartest Rooftop Solar Planning Platform',
    description: 'Plan your rooftop solar with clear numbers. Compare quotes, track projects, monitor performance. Built for Indian homeowners.',
    type: 'website',
    url: BASE_URL,
    siteName: 'RoofToGrid',
    locale: 'en_IN',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'RoofToGrid — India\'s Smartest Rooftop Solar Planning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoofToGrid — India\'s Smartest Rooftop Solar Planning Platform',
    description: 'Plan your rooftop solar with clear numbers. Compare quotes, track projects, monitor performance.',
    creator: '@rooftogrid',
    images: [`${BASE_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
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
      name: 'RoofToGrid Technologies',
      url: BASE_URL,
      logo: `${BASE_URL}/icon.png`,
      sameAs: [],
      description: 'India\'s smartest rooftop solar planning platform for homeowners.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'aarsh@rooftogrid.in',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
      },
    },
    {
      '@type': 'WebApplication',
      name: 'RoofToGrid',
      url: BASE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          name: 'Free Plan',
          description: 'Core solar planning tools for homeowners',
        },
        {
          '@type': 'Offer',
          price: '499',
          priceCurrency: 'INR',
          name: 'Pro Plan',
          description: 'Full power for serious solar buyers with unlimited features',
          billingIncrement: 'P1M',
        },
      ],
      featureList: [
        'Solar sizing calculator',
        'PM Surya Ghar subsidy calculator',
        'Quote comparison with value scoring',
        'Project milestone tracking',
        'Performance monitoring',
        'Private document vault',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much does rooftop solar cost in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A typical residential rooftop solar system costs ₹48,000–₹65,000 per kWp before subsidy. Under PM Surya Ghar, you can get up to ₹78,000 subsidy, bringing the net cost for a 3 kWp system to around ₹1,18,000.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the PM Surya Ghar subsidy?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PM Surya Ghar provides ₹30,000/kW for the first 2 kW and ₹18,000 for the 3rd kW, with a maximum subsidy of ₹78,000 per household for residential rooftop solar systems.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a solar system take to pay back?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most residential systems pay back in 4–6 years after subsidy, depending on your electricity tariff and consumption. After payback, you save on electricity for the remaining 20+ years of the system\'s life.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rtg-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
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
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}

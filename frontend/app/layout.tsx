import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'RoofToGrid — rooftop solar, decided with clear numbers',
    template: '%s · RoofToGrid',
  },
  description:
    'Work out whether rooftop solar makes sense for your home, compare installer quotes on equal terms, and track your project from survey to net metering.',
  applicationName: 'RoofToGrid',
  openGraph: {
    title: 'RoofToGrid',
    description: 'Rooftop solar planning, quote comparison and project tracking for homeowners.',
    type: 'website',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rtg-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

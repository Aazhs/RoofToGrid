'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Feedback';
import { ThemeProvider } from '@/components/landing/ThemeContext';
import { LanguageProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}


'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Feedback';
import { ThemeProvider } from '@/components/landing/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

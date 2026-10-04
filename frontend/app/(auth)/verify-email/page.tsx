'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert, useToast } from '@/components/ui/Feedback';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'your account email';
  const { notify } = useToast();

  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 600));
    setResending(false);
    setResendSuccess(true);
    notify('Verification link resent to your email');
  };

  const handleConfirm = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 700));
    setVerifying(false);
    notify('Email verified successfully! Welcome to RoofToGrid.', 'success');
    router.push('/dashboard');
  };

  return (
    <Card>
      <CardBody>
        <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-slate-900 font-jakarta">
          Verify your email address
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          We&apos;ve sent a verification link to <strong className="text-slate-800">{email}</strong>. Please check your inbox and click the link to activate all solar planning tools.
        </p>

        {resendSuccess && (
          <div className="mt-4">
            <Alert tone="success">
              A fresh confirmation email has been dispatched. Please check your spam folder if it doesn&apos;t arrive within 2 minutes.
            </Alert>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="primary"
            loading={verifying}
            className="w-full"
            onClick={handleConfirm}
          >
            Confirm Email &amp; Open Dashboard
          </Button>

          <Button
            type="button"
            variant="secondary"
            loading={resending}
            className="w-full"
            onClick={handleResend}
          >
            Resend confirmation email
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <Link
            href="/login"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            &larr; Return to sign in
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading verification screen...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setPending(true);
    // Simulate secure reset token dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPending(false);
    setSubmitted(true);
  };

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered email address and we&apos;ll send you a password recovery link.
        </p>

        {submitted ? (
          <div className="mt-5 space-y-4">
            <Alert tone="success" title="Recovery link sent">
              If an account exists for <strong className="font-semibold">{email}</strong>, you will receive a secure password reset link shortly.
            </Alert>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-medium text-slate-800">For review &amp; demo testing:</p>
              <p>You can proceed directly to the reset password page:</p>
              <Link 
                href={`/reset-password?token=demo_token_${encodeURIComponent(email)}`}
                className="inline-block font-semibold text-brand-700 hover:underline"
              >
                Set new password now &rarr;
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                &larr; Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <TextField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              placeholder="e.g. yourname@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" loading={pending} className="w-full">
              Send reset link
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

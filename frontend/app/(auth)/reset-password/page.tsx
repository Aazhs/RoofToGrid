'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert, useToast } from '@/components/ui/Feedback';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { notify } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPending(false);

    notify('Password reset successfully. Please sign in.', 'success');
    router.push('/login');
  };

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your new password must be at least 8 characters.
        </p>

        {!token && (
          <div className="mt-4">
            <Alert tone="warning">
              No reset token detected. You can still test this flow below.
            </Alert>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <TextField
            id="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" loading={pending} className="w-full">
            Update password &amp; Sign in
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
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

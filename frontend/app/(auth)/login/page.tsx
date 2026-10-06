'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { useAuth } from '@/lib/auth-context';
import { useSubmit } from '@/lib/hooks';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { pending, error, fieldErrors, run } = useSubmit();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await run(async () => {
      await login(email, password);
      return true;
    });
    if (ok) router.push('/dashboard');
  };

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Pick up where you left off.</p>

        <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={fieldErrors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            error={fieldErrors.password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" loading={pending} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New here?{' '}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Create a free account
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Just looking around?{' '}
          <Link href="/demo" className="font-medium text-brand-700 hover:underline">
            Try the guided demo
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

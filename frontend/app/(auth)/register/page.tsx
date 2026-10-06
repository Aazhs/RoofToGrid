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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { pending, error, fieldErrors, run } = useSubmit();
  const [values, setValues] = useState({ fullName: '', email: '', password: '', city: '', pincode: '' });

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await run(async () => {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        city: values.city || undefined,
        pincode: values.pincode || undefined,
      });
      return true;
    });
    if (ok) router.push('/onboarding');
  };

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Free. No installer gets your details until you decide to share them.
        </p>

        <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <TextField
            id="fullName"
            label="Your name"
            autoComplete="name"
            required
            value={values.fullName}
            error={fieldErrors.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            error={fieldErrors.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={values.password}
            error={fieldErrors.password}
            hint="At least 8 characters, with a letter and a number."
            onChange={(e) => update('password', e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="city"
              label="City (optional)"
              value={values.city}
              error={fieldErrors.city}
              onChange={(e) => update('city', e.target.value)}
            />
            <TextField
              id="pincode"
              label="Pincode (optional)"
              inputMode="numeric"
              maxLength={6}
              value={values.pincode}
              error={fieldErrors.pincode}
              hint="Helps us guess your DISCOM."
              onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <Button type="submit" loading={pending} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Not ready to sign up?{' '}
          <Link href="/demo" className="font-medium text-brand-700 hover:underline">
            Try the four-step demo first
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

'use client';

/** Account details, password change, assumptions disclosure and honest integration status. */
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SelectField, TextField } from '@/components/ui/Field';
import { Alert, Spinner, useToast } from '@/components/ui/Feedback';
import { AssumptionsPanel } from '@/components/domain/AssumptionsPanel';
import { PROPERTY_TYPES } from '@/lib/constants';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { notify } = useToast();
  const profile = useApi(() => api.profile.get());
  const assumptions = useApi(() => api.sizing.assumptions());
  const integrations = useApi(() => api.health.integrations());
  const details = useSubmit();
  const password = useSubmit();

  const [form, setForm] = useState({
    fullName: '',
    city: '',
    state: '',
    pincode: '',
    discomName: '',
    consumerNumber: '',
    phone: '',
    propertyType: '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (profile.data) {
      setForm({
        fullName: profile.data.fullName ?? '',
        city: profile.data.profile?.city ?? '',
        state: profile.data.profile?.state ?? '',
        pincode: profile.data.profile?.pincode ?? '',
        discomName: profile.data.profile?.discomName ?? '',
        consumerNumber: profile.data.profile?.consumerNumber ?? '',
        phone: profile.data.profile?.phone ?? '',
        propertyType: profile.data.profile?.propertyType ?? '',
      });
    }
  }, [profile.data]);

  const saveDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await details.run(() => api.profile.update({
      fullName: form.fullName,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      discomName: form.discomName || null,
      consumerNumber: form.consumerNumber || null,
      phone: form.phone || null,
      propertyType: form.propertyType || null,
    }));
    if (saved) {
      notify('Profile updated');
      await refreshUser();
      await profile.reload();
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const done = await password.run(() => api.auth.changePassword(passwords));
    if (done) {
      notify('Password changed. Please sign in again.');
      await logout();
    }
  };

  if (profile.loading) return <Spinner label="Loading your profile" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your account</h1>
        <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
      </div>

      <Card>
        <CardHeader title="Home and connection details" description="Used to keep calculations and project paperwork tied to the right property." />
        <CardBody>
          {details.error && <Alert tone="error" className="mb-3">{details.error}</Alert>}
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveDetails} noValidate>
            <TextField id="fullName" label="Name" required value={form.fullName} error={details.fieldErrors.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField id="phone" label="Phone" value={form.phone} error={details.fieldErrors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField id="city" label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField id="state" label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <TextField id="pincode" label="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} error={details.fieldErrors.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })} />
            <SelectField id="propertyType" label="Property type" options={[{ value: '', label: 'Not set' }, ...PROPERTY_TYPES]} value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} />
            <TextField id="discomName" label="DISCOM" value={form.discomName} onChange={(e) => setForm({ ...form, discomName: e.target.value })} />
            <TextField id="consumerNumber" label="Consumer number" value={form.consumerNumber} hint="From your electricity bill. Needed for net-metering paperwork." onChange={(e) => setForm({ ...form, consumerNumber: e.target.value })} />
            <div className="sm:col-span-2"><Button type="submit" loading={details.pending}>Save details</Button></div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Password" description="Changing it signs you out of every device." />
        <CardBody>
          {password.error && <Alert tone="error" className="mb-3">{password.error}</Alert>}
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={changePassword} noValidate>
            <TextField id="currentPassword" label="Current password" type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            <TextField id="newPassword" label="New password" type="password" autoComplete="new-password" required value={passwords.newPassword} error={password.fieldErrors.newPassword} hint="At least 8 characters, with a letter and a number." onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            <div className="sm:col-span-2"><Button type="submit" variant="secondary" loading={password.pending}>Change password</Button></div>
          </form>
        </CardBody>
      </Card>

      {assumptions.data && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">The numbers behind estimates</h2>
          <AssumptionsPanel assumptions={assumptions.data} />
        </div>
      )}

      {integrations.data && (
        <Card>
          <CardHeader title="Automation status" description="Manual means no third-party connection is operating yet." />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {Object.entries(integrations.data).map(([key, value]) => {
                const detail = value as { name?: string; live?: boolean } | string;
                const isObject = typeof detail === 'object' && detail !== null;
                const live = isObject ? Boolean(detail.live) : false;
                const name = isObject ? detail.name ?? '—' : String(detail);
                return (
                  <li key={key} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
                    <span className="text-slate-700">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className="flex items-center gap-2"><span className="text-slate-500">{name}</span><Badge tone={live ? 'good' : 'muted'}>{live ? 'Live' : 'Manual'}</Badge></span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

'use client';

/** Account details, password change, assumptions disclosure and integration status (NFR-U4, NFR-X2). */
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
import { useSubscription } from '@/lib/subscription';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { notify } = useToast();
  const { isPro, plan, utr, billingCycle, expiresAt, cancel } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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
    const saved = await details.run(() =>
      api.profile.update({
        fullName: form.fullName,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
        discomName: form.discomName || null,
        consumerNumber: form.consumerNumber || null,
        phone: form.phone || null,
        propertyType: form.propertyType || null,
      }),
    );
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
      setPasswords({ currentPassword: '', newPassword: '' });
      await logout();
    }
  };

  const handleCancelSub = () => {
    if (confirm('Cancel your Pro subscription? You will revert to the free plan.')) {
      cancel();
      notify('Subscription cancelled');
    }
  };

  if (profile.loading) return <Spinner label="Loading your profile" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your account</h1>
          <p className="mt-1 text-sm text-slate-600">{user?.email ?? 'arun.sharma@example.com (Prototype Mode)'}</p>
        </div>
        {isPro && (
          <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> Pro Active
          </span>
        )}
      </div>

      {/* Subscription Card */}
      <Card className={isPro ? 'border-amber-300 bg-amber-50/20' : ''}>
        <CardHeader
          title="Subscription & Membership"
          description="Access to PDF Feasibility Reports, unlimited quote comparisons, and priority support."
        />
        <CardBody>
          {isPro ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 uppercase">
                      PRO PLAN
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{billingCycle === 'ANNUAL' ? '4,999/yr' : '499/mo'}
                    </span>
                    <Badge tone="good">Active</Badge>
                  </div>
                  {utr && (
                    <p className="text-xs text-slate-500 font-mono">
                      UPI Ref / UTR: <span className="font-semibold text-slate-700">{utr}</span>
                    </p>
                  )}
                  {expiresAt && (
                    <p className="text-xs text-slate-500">
                      Next renewal: {new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancelSub}>
                    Cancel Pro
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Free Tier</span>
                  <Badge tone="muted">Active</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Includes basic sizing estimates and up to 3 quotes. Upgrade to Pro for downloadable PDF Feasibility Reports and unlimited comparisons.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setCheckoutOpen(true)}
                className="shrink-0 bg-brand-700 hover:bg-brand-800"
              >
                Upgrade to Pro (₹499/mo)
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <UpiCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />


      <Card>
        <CardHeader title="Details" description="Used for subsidy rules, DISCOM matching and your documents." />
        <CardBody>
          {details.error && (
            <Alert tone="error" className="mb-3">
              {details.error}
            </Alert>
          )}
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveDetails} noValidate>
            <TextField
              id="fullName"
              label="Name"
              required
              value={form.fullName}
              error={details.fieldErrors.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <TextField
              id="phone"
              label="Phone"
              value={form.phone}
              error={details.fieldErrors.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              id="city"
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <TextField
              id="state"
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <TextField
              id="pincode"
              label="Pincode"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              error={details.fieldErrors.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
            />
            <SelectField
              id="propertyType"
              label="Property type"
              options={[{ value: '', label: 'Not set' }, ...PROPERTY_TYPES]}
              value={form.propertyType}
              onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
            />
            <TextField
              id="discomName"
              label="DISCOM"
              value={form.discomName}
              onChange={(e) => setForm({ ...form, discomName: e.target.value })}
            />
            <TextField
              id="consumerNumber"
              label="Consumer number"
              value={form.consumerNumber}
              hint="From your electricity bill. Needed for net metering applications."
              onChange={(e) => setForm({ ...form, consumerNumber: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button type="submit" loading={details.pending}>
                Save details
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Password" description="Changing it signs you out of every device." />
        <CardBody>
          {password.error && (
            <Alert tone="error" className="mb-3">
              {password.error}
            </Alert>
          )}
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={changePassword} noValidate>
            <TextField
              id="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
            <TextField
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              value={passwords.newPassword}
              error={password.fieldErrors.newPassword}
              hint="At least 8 characters, with a letter and a number."
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" loading={password.pending}>
                Change password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {assumptions.data && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">The numbers behind our estimates</h2>
          <AssumptionsPanel assumptions={assumptions.data} />
        </div>
      )}

      {integrations.data && (
        <Card>
          <CardHeader
            title="What is connected"
            description="We would rather tell you what is manual than pretend it is automatic."
          />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {Object.entries(integrations.data).map(([key, value]) => {
                const detail = value as { name?: string; live?: boolean } | string;
                const isObject = typeof detail === 'object' && detail !== null;
                const live = isObject ? Boolean(detail.live) : false;
                const name = isObject ? detail.name ?? '—' : String(detail);
                return (
                  <li key={key} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-700">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-slate-500">{name}</span>
                      {isObject && <Badge tone={live ? 'good' : 'muted'}>{live ? 'Live' : 'Manual'}</Badge>}
                    </span>
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

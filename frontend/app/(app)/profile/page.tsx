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
          <p className="mt-1 text-sm text-slate-600">{user ? user.email : 'demo@rooftogrid.in'}</p>
        </div>
        {isPro && <Badge tone="brand">Pro Active</Badge>}
      </div>

      {/* Subscription Card */}
      <Card>
        <CardHeader
          title="Plan & Membership"
          description="Access to downloadable PDF Feasibility Reports, quote comparisons, and priority support."
          actions={
            isPro ? (
              <Badge tone="good">Active</Badge>
            ) : (
              <Badge tone="muted">Free Plan</Badge>
            )
          }
        />
        <CardBody>
          {isPro ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    RoofToGrid Pro ({billingCycle === 'ANNUAL' ? 'Annual Pass · ₹4,999/yr' : 'Monthly Pass · ₹499/mo'})
                  </span>
                </div>
                {utr && (
                  <p className="text-xs text-slate-500 font-mono">
                    UPI Reference: {utr}
                  </p>
                )}
                {expiresAt && (
                  <p className="text-xs text-slate-500">
                    Active through: {new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={handleCancelSub}>
                Cancel subscription
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Free Tier</p>
                <p className="mt-1 text-xs text-slate-500">
                  Includes sizing estimates and quote comparisons. Upgrade to Pro for official PDF Feasibility & Subsidy Reports.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setCheckoutOpen(true)}
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

      {/* Referral & Rewards Program */}
      <Card>
        <CardHeader
          title="Refer Friends & Earn Free Pro"
          description="Give friends unbiased solar planning tools. For every 2 friends who sign up and size their roof, you get 1 Month of Pro for free."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 truncate select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}?ref=${user?.id ? user.id.slice(0, 8) : 'solar-vip'}` : 'https://rooftogrid.in?ref=solar-vip'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const link = `${window.location.origin}?ref=${user?.id ? user.id.slice(0, 8) : 'solar-vip'}`;
                  void navigator.clipboard.writeText(link);
                  notify('Referral link copied to clipboard!');
                }}
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  '☀️ I use RoofToGrid to plan my rooftop solar with real numbers and PM Surya Ghar subsidies. Try it with my link: https://rooftogrid.in?ref=solar-vip'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <svg className="h-3.5 w-3.5 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-500 font-medium">Homeowners Referred</span>
              <p className="text-xl font-bold text-slate-900 font-jakarta mt-0.5">2</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-500 font-medium">Free Pro Earned</span>
              <p className="text-xl font-bold text-brand-700 font-jakarta mt-0.5">1 Month</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-500 font-medium">Next Reward</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">1 more invite &rarr; +1 Month</p>
            </div>
          </div>
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

'use client';

/**
 * Four-step onboarding wizard: profile → bills → roof → results (US-A3 … US-A9).
 * Each step writes to the server as it completes, and `onboardingStep` is persisted so a refresh resumes
 * where the user left off (NFR-U3).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SelectField, TextField } from '@/components/ui/Field';
import { Alert, Spinner, useToast } from '@/components/ui/Feedback';
import { Stepper } from '@/components/ui/Stepper';
import { Term } from '@/components/domain/Term';
import { SizingResultView } from '@/components/domain/SizingResultView';
import { DocumentUploader } from '@/components/domain/DocumentPanel';
import { ORIENTATIONS, PROPERTY_TYPES, ROOF_TYPES, SHADING_LEVELS } from '@/lib/constants';
import { currentMonth, formatKwp, formatNumber } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';
import type { Orientation, RoofType, ShadingLevel, SizingRun } from '@/lib/types';

const STEPS = ['Your home', 'Your bill', 'Your roof', 'Your options'];

export default function OnboardingPage() {
  const { notify } = useToast();
  const [step, setStep] = useState(0);
  const [run, setRun] = useState<SizingRun | null>(null);

  const summary = useApi(() => api.profile.summary());
  const { pending, error, fieldErrors, run: submit } = useSubmit();

  // Home
  const [home, setHome] = useState({ city: '', state: '', pincode: '', discomName: '', propertyType: 'INDEPENDENT_HOUSE' });
  // Bill
  const [bill, setBill] = useState({ billMonth: currentMonth(), unitsKwh: '', billAmount: '', tariffPerKwh: '' });
  // Roof
  const [roof, setRoof] = useState({
    label: 'My roof',
    roofType: 'FLAT' as RoofType,
    usableAreaSqft: '',
    orientation: 'S' as Orientation,
    shadingLevel: 'NONE' as ShadingLevel,
  });

  useEffect(() => {
    const profile = summary.data?.profile;
    if (profile) {
      setHome({
        city: profile.city ?? '',
        state: profile.state ?? '',
        pincode: profile.pincode ?? '',
        discomName: profile.discomName ?? '',
        propertyType: profile.propertyType ?? 'INDEPENDENT_HOUSE',
      });
      setStep(Math.min(profile.onboardingStep ?? 0, 3));
    }
  }, [summary.data?.profile]);

  const stats = summary.data?.billStats;

  const goTo = async (next: number) => {
    setStep(next);
    await api.profile.setStep(next, next >= 3).catch(() => undefined);
  };

  const lookupDiscom = async (pincode: string) => {
    if (pincode.length !== 6) return;
    const result = await api.profile.discomLookup(pincode).catch(() => null);
    if (result?.discomName) {
      setHome((current) => ({
        ...current,
        discomName: current.discomName || result.discomName || '',
        state: current.state || result.state || '',
      }));
    }
  };

  const saveHome = async () => {
    const ok = await submit(() =>
      api.profile.update({
        city: home.city || null,
        state: home.state || null,
        pincode: home.pincode || null,
        discomName: home.discomName || null,
        propertyType: home.propertyType || null,
      }),
    );
    if (ok) await goTo(1);
  };

  const saveBill = async () => {
    const payload: Record<string, unknown> = {
      billMonth: bill.billMonth,
      unitsKwh: Number(bill.unitsKwh),
    };
    if (bill.billAmount) payload.billAmount = Number(bill.billAmount);
    if (bill.tariffPerKwh) payload.tariffPerKwh = Number(bill.tariffPerKwh);

    const ok = await submit(() => api.bills.create(payload));
    if (ok) {
      notify('Bill saved');
      setBill({ billMonth: currentMonth(), unitsKwh: '', billAmount: '', tariffPerKwh: '' });
      await summary.reload();
    }
  };

  const saveRoofAndSize = async () => {
    const created = await submit(async () => {
      const roofProfile = await api.roof.create({
        label: roof.label,
        roofType: roof.roofType,
        usableAreaSqft: Number(roof.usableAreaSqft),
        orientation: roof.orientation,
        shadingLevel: roof.shadingLevel,
        isPrimary: true,
      });

      const freshStats = await api.bills.stats();
      return api.sizing.createRun({
        avgMonthlyUnits: freshStats.avgMonthlyUnits,
        tariffPerKwh: freshStats.weightedTariffPerKwh,
        roofProfileId: roofProfile.id,
      });
    });

    if (created) {
      setRun(created);
      await goTo(3);
    }
  };

  if (summary.loading) return <Spinner label="Loading your progress" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Get set up</h1>
        <p className="mt-1 text-sm text-slate-600">
          Four short steps. Everything is saved as you go, so you can stop and come back.
        </p>
      </div>

      <Stepper steps={STEPS} current={step} onSelect={(index) => void goTo(index)} />

      {error && <Alert tone="error">{error}</Alert>}

      {step === 0 && (
        <Card>
          <CardHeader title="Where is the home?" description="This sets your subsidy rules and DISCOM." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="city"
              label="City"
              value={home.city}
              error={fieldErrors.city}
              onChange={(e) => setHome({ ...home, city: e.target.value })}
            />
            <TextField
              id="pincode"
              label="Pincode"
              inputMode="numeric"
              maxLength={6}
              value={home.pincode}
              error={fieldErrors.pincode}
              hint="We use this to guess your DISCOM."
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setHome({ ...home, pincode: value });
                void lookupDiscom(value);
              }}
            />
            <TextField
              id="state"
              label="State"
              value={home.state}
              onChange={(e) => setHome({ ...home, state: e.target.value })}
            />
            <TextField
              id="discomName"
              label="DISCOM"
              value={home.discomName}
              hint={
                <>
                  Your <Term term="DISCOM">distribution company</Term>, printed on your bill.
                </>
              }
              onChange={(e) => setHome({ ...home, discomName: e.target.value })}
            />
            <SelectField
              id="propertyType"
              label="Property type"
              options={PROPERTY_TYPES}
              value={home.propertyType}
              onChange={(e) => setHome({ ...home, propertyType: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button loading={pending} onClick={() => void saveHome()}>
                Save and continue
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Add a recent bill"
              description="Three or more months gives a reliable average. Units and either amount or tariff is enough."
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="billMonth"
                label="Bill month"
                type="month"
                required
                value={bill.billMonth}
                error={fieldErrors.billMonth}
                onChange={(e) => setBill({ ...bill, billMonth: e.target.value })}
              />
              <TextField
                id="unitsKwh"
                label="Units consumed (kWh)"
                type="number"
                min={1}
                required
                value={bill.unitsKwh}
                error={fieldErrors.unitsKwh}
                onChange={(e) => setBill({ ...bill, unitsKwh: e.target.value })}
              />
              <TextField
                id="billAmount"
                label="Bill amount (₹)"
                type="number"
                min={1}
                value={bill.billAmount}
                error={fieldErrors.billAmount}
                hint="We work out your tariff from this."
                onChange={(e) => setBill({ ...bill, billAmount: e.target.value })}
              />
              <TextField
                id="tariffPerKwh"
                label="Or tariff per unit (₹)"
                type="number"
                min={0.5}
                step={0.1}
                value={bill.tariffPerKwh}
                error={fieldErrors.tariffPerKwh}
                onChange={(e) => setBill({ ...bill, tariffPerKwh: e.target.value })}
              />
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <Button variant="secondary" loading={pending} onClick={() => void saveBill()}>
                  Add this month
                </Button>
                <Button onClick={() => void goTo(2)} disabled={!stats || stats.monthsCounted === 0}>
                  Continue
                </Button>
                {stats && stats.monthsCounted > 0 && (
                  <p className="text-sm text-slate-600">
                    {stats.monthsCounted} month{stats.monthsCounted === 1 ? '' : 's'} saved · average{' '}
                    {formatNumber(stats.avgMonthlyUnits, 0)} units at ₹{stats.weightedTariffPerKwh}/unit
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Keep a copy of the bill (optional)"
              description="Stored privately in your document vault. We do not read it automatically yet."
              level={3}
            />
            <CardBody>
              <DocumentUploader
                defaultCategory="BILL"
                compact
                onUploaded={() => notify('Bill uploaded to your vault')}
              />
            </CardBody>
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader title="Describe your roof" description="Rough numbers are fine. You can refine later." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="label"
              label="Name this roof"
              value={roof.label}
              onChange={(e) => setRoof({ ...roof, label: e.target.value })}
            />
            <SelectField
              id="roofType"
              label="Roof type"
              options={ROOF_TYPES.map((r) => ({ value: r.value, label: r.label }))}
              value={roof.roofType}
              hint={ROOF_TYPES.find((r) => r.value === roof.roofType)?.hint}
              onChange={(e) => setRoof({ ...roof, roofType: e.target.value as RoofType })}
            />
            <TextField
              id="usableAreaSqft"
              label="Usable area (sqft)"
              type="number"
              min={10}
              required
              value={roof.usableAreaSqft}
              error={fieldErrors.usableAreaSqft}
              hint="Shade-free area you are happy to cover, leaving walkways."
              onChange={(e) => setRoof({ ...roof, usableAreaSqft: e.target.value })}
            />
            <SelectField
              id="orientation"
              label="Direction it faces"
              options={ORIENTATIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={roof.orientation}
              onChange={(e) => setRoof({ ...roof, orientation: e.target.value as Orientation })}
            />
            <SelectField
              id="shadingLevel"
              label="Shading"
              options={SHADING_LEVELS.map((s) => ({ value: s.value, label: s.label }))}
              value={roof.shadingLevel}
              hint={SHADING_LEVELS.find((s) => s.value === roof.shadingLevel)?.hint}
              onChange={(e) => setRoof({ ...roof, shadingLevel: e.target.value as ShadingLevel })}
            />
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <Button loading={pending} onClick={() => void saveRoofAndSize()} disabled={!roof.usableAreaSqft}>
                Save roof and show my options
              </Button>
              <Button variant="secondary" onClick={() => void goTo(1)}>
                Back
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {run ? (
            <>
              <Alert tone="success" title="Saved">
                Your sizing run is stored under Sizing, so you can come back to it any time.
              </Alert>
              <SizingResultView
                suitability={run.suitability}
                suitabilityReasons={run.suitabilityReasons}
                roofCapacityKwp={run.roofCapacityKwp}
                scenarios={run.scenarios}
                assumptions={run.assumptions}
              />
              <Card className="border-brand-200 bg-brand-50">
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-brand-900">
                    Next: collect two or three installer quotes and let us normalise them
                    {run.scenarios[0] ? ` around ${formatKwp(run.scenarios.at(-1)?.systemSizeKwp ?? null)}` : ''}.
                  </p>
                  <ButtonLink href="/quotes/new">Add a quote</ButtonLink>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody className="space-y-3">
                <p className="text-sm text-slate-700">
                  You are set up. Open{' '}
                  <Link href="/sizing" className="font-medium text-brand-700 hover:underline">
                    Sizing
                  </Link>{' '}
                  to run or revisit an estimate.
                </p>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href="/sizing">Go to sizing</ButtonLink>
                  <ButtonLink href="/quotes/new" variant="secondary">
                    Add a quote
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

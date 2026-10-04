'use client';

/** Roof profiles (US-A6). Capacity per roof comes from the server so UI and estimates never disagree. */
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { DocumentUploader, DocumentList } from '@/components/domain/DocumentPanel';
import { Term } from '@/components/domain/Term';
import { BalconyVisionEstimator } from '@/components/domain/BalconyVisionEstimator';
import { ORIENTATIONS, ROOF_TYPES, SHADING_LEVELS } from '@/lib/constants';
import { formatKwp, formatNumber, titleCase } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';
import type { Orientation, RoofType, ShadingLevel } from '@/lib/types';

const EMPTY = {
  label: 'My roof',
  roofType: 'FLAT' as RoofType,
  usableAreaSqft: '',
  orientation: 'S' as Orientation,
  shadingLevel: 'NONE' as ShadingLevel,
  tiltDegrees: '',
  structureType: '',
  notes: '',
};

export default function RoofPage() {
  const { notify } = useToast();
  const roofs = useApi(() => api.roof.list());
  const photos = useApi(() => api.documents.list({ category: 'PHOTO' }));
  const { pending, error, fieldErrors, run } = useSubmit();
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [showBalconyVision, setShowBalconyVision] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      label: form.label,
      roofType: form.roofType,
      usableAreaSqft: Number(form.usableAreaSqft),
      orientation: form.orientation,
      shadingLevel: form.shadingLevel,
    };
    if (form.tiltDegrees) payload.tiltDegrees = Number(form.tiltDegrees);
    if (form.structureType) payload.structureType = form.structureType;
    if (form.notes) payload.notes = form.notes;

    const created = await run(() => api.roof.create(payload));
    if (created) {
      notify('Roof saved');
      setForm(EMPTY);
      setShowForm(false);
      await roofs.reload();
    }
  };

  const makePrimary = async (id: string) => {
    await api.roof.update(id, { isPrimary: true });
    await roofs.reload();
  };

  const remove = async (id: string) => {
    await api.roof.remove(id);
    notify('Roof removed');
    await roofs.reload();
  };

  const handleSaveBalconyProfile = async (profile: {
    label: string;
    roofType: RoofType;
    usableAreaSqft: number;
    orientation: Orientation;
    shadingLevel: ShadingLevel;
    notes: string;
  }) => {
    const created = await run(() => api.roof.create(profile));
    if (created) {
      notify(`Saved ${created.label} (${created.usableAreaSqft} sq ft)`);
      setShowBalconyVision(false);
      await roofs.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your roof & balcony</h1>
          <p className="mt-1 text-sm text-slate-600">
            Area, direction and shade decide how much <Term term="kWp">capacity</Term> fits and how much it
            will generate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setShowBalconyVision((v) => !v);
              if (!showBalconyVision) setShowForm(false);
            }}
            variant={showBalconyVision ? 'secondary' : 'secondary'}
            className="border-brand-300 text-brand-800 hover:bg-brand-50"
          >
            <span>📐</span>
            <span>{showBalconyVision ? 'Close Balcony AI' : 'Balcony AI Vision'}</span>
          </Button>
          <Button
            onClick={() => {
              setShowForm((v) => !v);
              if (!showForm) setShowBalconyVision(false);
            }}
            variant={showForm ? 'secondary' : 'primary'}
          >
            {showForm ? 'Cancel' : 'Add a roof'}
          </Button>
        </div>
      </div>

      {/* Balcony AI Vision Estimator */}
      {showBalconyVision && (
        <BalconyVisionEstimator onSaveProfile={handleSaveBalconyProfile} />
      )}

      {showForm && (
        <Card>
          <CardHeader title="Roof details" description="Rough measurements are fine to start." />
          <CardBody>
            {error && (
              <Alert tone="error" className="mb-3">
                {error}
              </Alert>
            )}
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
              <TextField
                id="label"
                label="Name"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              <SelectField
                id="roofType"
                label="Roof type"
                options={ROOF_TYPES.map((r) => ({ value: r.value, label: r.label }))}
                value={form.roofType}
                hint={ROOF_TYPES.find((r) => r.value === form.roofType)?.hint}
                onChange={(e) => setForm({ ...form, roofType: e.target.value as RoofType })}
              />
              <TextField
                id="usableAreaSqft"
                label="Usable area (sqft)"
                type="number"
                min={10}
                required
                value={form.usableAreaSqft}
                error={fieldErrors.usableAreaSqft}
                onChange={(e) => setForm({ ...form, usableAreaSqft: e.target.value })}
              />
              <SelectField
                id="orientation"
                label="Direction it faces"
                options={ORIENTATIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={form.orientation}
                onChange={(e) => setForm({ ...form, orientation: e.target.value as Orientation })}
              />
              <SelectField
                id="shadingLevel"
                label="Shading"
                options={SHADING_LEVELS.map((s) => ({ value: s.value, label: s.label }))}
                value={form.shadingLevel}
                hint={SHADING_LEVELS.find((s) => s.value === form.shadingLevel)?.hint}
                onChange={(e) => setForm({ ...form, shadingLevel: e.target.value as ShadingLevel })}
              />
              <TextField
                id="tiltDegrees"
                label="Tilt (degrees, optional)"
                type="number"
                min={0}
                max={60}
                value={form.tiltDegrees}
                onChange={(e) => setForm({ ...form, tiltDegrees: e.target.value })}
              />
              <TextField
                id="structureType"
                label="Structure notes (optional)"
                value={form.structureType}
                placeholder="RCC slab, elevated MS structure planned…"
                onChange={(e) => setForm({ ...form, structureType: e.target.value })}
              />
              <TextAreaField
                id="notes"
                label="Anything else"
                wrapperClassName="sm:col-span-2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Button type="submit" loading={pending}>
                  Save roof
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {roofs.loading ? (
        <Spinner />
      ) : roofs.data && roofs.data.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {roofs.data.map((roof) => (
            <Card as="li" key={roof.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">{roof.label}</h2>
                  {roof.isPrimary && <Badge tone="brand">Primary</Badge>}
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Fits about" value={formatKwp(roof.estimatedCapacityKwp)} />
                  <Row label="Usable area" value={`${formatNumber(roof.usableAreaSqft)} sqft`} />
                  <Row label="Type" value={titleCase(roof.roofType)} />
                  <Row label="Faces" value={roof.orientation} />
                  <Row label="Shading" value={titleCase(roof.shadingLevel)} />
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!roof.isPrimary && (
                    <Button size="sm" variant="secondary" onClick={() => void makePrimary(roof.id)}>
                      Make primary
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => void remove(roof.id)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No roof described yet"
          description="Add one roof to unlock sizing scenarios. You can add more later if you have separate slabs."
          action={<Button onClick={() => setShowForm(true)}>Add a roof</Button>}
        />
      )}

      <Card>
        <CardHeader
          title="Roof photos"
          description="Optional. Useful when you ask installers to quote without a site visit."
          level={3}
        />
        <CardBody className="space-y-4">
          <DocumentUploader
            defaultCategory="PHOTO"
            onUploaded={() => {
              notify('Photo uploaded');
              void photos.reload();
            }}
          />
          <DocumentList
            documents={photos.data ?? []}
            emptyMessage="No photos uploaded."
            onDeleted={() => void photos.reload()}
          />
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}

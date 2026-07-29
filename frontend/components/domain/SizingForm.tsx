'use client';

/** Shared sizing input form: landing page calculator (US-A1) and the in-app wizard step. */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/Field';
import { Term } from '@/components/domain/Term';
import { ORIENTATIONS, ROOF_TYPES, SHADING_LEVELS } from '@/lib/constants';
import type { Orientation, RoofType, ShadingLevel } from '@/lib/types';

export interface SizingFormValues {
  avgMonthlyUnits: number;
  tariffPerKwh: number;
  roofType: RoofType;
  usableAreaSqft: number;
  orientation: Orientation;
  shadingLevel: ShadingLevel;
}

export const DEFAULT_SIZING_VALUES: SizingFormValues = {
  avgMonthlyUnits: 350,
  tariffPerKwh: 8.5,
  roofType: 'FLAT',
  usableAreaSqft: 500,
  orientation: 'S',
  shadingLevel: 'NONE',
};

export function SizingForm({
  initial = DEFAULT_SIZING_VALUES,
  pending = false,
  submitLabel = 'Show my options',
  fieldErrors = {},
  onSubmit,
  footer,
}: {
  initial?: SizingFormValues;
  pending?: boolean;
  submitLabel?: string;
  fieldErrors?: Record<string, string>;
  onSubmit: (values: SizingFormValues) => void | Promise<void>;
  footer?: React.ReactNode;
}) {
  const [values, setValues] = useState<SizingFormValues>(initial);

  const update = <K extends keyof SizingFormValues>(key: K, value: SizingFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const roofHint = ROOF_TYPES.find((r) => r.value === values.roofType)?.hint;
  const shadingHint = SHADING_LEVELS.find((s) => s.value === values.shadingLevel)?.hint;

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(values);
      }}
      noValidate
    >
      <TextField
        id="avgMonthlyUnits"
        label="Average monthly units"
        type="number"
        min={1}
        max={100000}
        step={1}
        required
        value={values.avgMonthlyUnits}
        error={fieldErrors.avgMonthlyUnits}
        hint={
          <>
            The <Term term="kWh">units (kWh)</Term> line on your electricity bill, averaged over a year.
          </>
        }
        onChange={(e) => update('avgMonthlyUnits', Number(e.target.value))}
      />

      <TextField
        id="tariffPerKwh"
        label="Tariff per unit (₹)"
        type="number"
        min={0.5}
        max={1000}
        step={0.1}
        required
        value={values.tariffPerKwh}
        error={fieldErrors.tariffPerKwh}
        hint="Divide your bill amount by the units if you are not sure."
        onChange={(e) => update('tariffPerKwh', Number(e.target.value))}
      />

      <SelectField
        id="roofType"
        label="Roof type"
        options={ROOF_TYPES.map((r) => ({ value: r.value, label: r.label }))}
        value={values.roofType}
        hint={roofHint}
        onChange={(e) => update('roofType', e.target.value as RoofType)}
      />

      <TextField
        id="usableAreaSqft"
        label="Usable roof area (sqft)"
        type="number"
        min={10}
        max={100000}
        step={10}
        required
        value={values.usableAreaSqft}
        error={fieldErrors.usableAreaSqft}
        hint="Only the shade-free part you are happy to cover, leaving walkways."
        onChange={(e) => update('usableAreaSqft', Number(e.target.value))}
      />

      <SelectField
        id="orientation"
        label="Which way does the roof face?"
        options={ORIENTATIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={values.orientation}
        hint="South-facing roofs generate the most in India."
        onChange={(e) => update('orientation', e.target.value as Orientation)}
      />

      <SelectField
        id="shadingLevel"
        label="Shading through the day"
        options={SHADING_LEVELS.map((s) => ({ value: s.value, label: s.label }))}
        value={values.shadingLevel}
        hint={shadingHint}
        onChange={(e) => update('shadingLevel', e.target.value as ShadingLevel)}
      />

      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} size="lg">
          {submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  );
}

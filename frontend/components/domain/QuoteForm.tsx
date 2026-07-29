'use client';

/** Structured quote entry (US-B1). Mirrors the fields the backend scores, nothing more. */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { Term } from '@/components/domain/Term';
import { FINANCING_TYPES, INVERTER_TYPES, PANEL_TECHNOLOGIES } from '@/lib/constants';
import type { FinancingType, InverterType, PanelTechnology, Quote } from '@/lib/types';

export interface QuoteFormValues {
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  panelBrand: string;
  panelTechnology: PanelTechnology;
  panelWattage: number | '';
  panelProductWarrantyYears: number;
  panelPerformanceWarrantyYears: number;
  inverterBrand: string;
  inverterType: InverterType;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  expectedAnnualGenerationKwh: number | '';
  financingType: FinancingType;
  interestRatePct: number | '';
  tenureMonths: number | '';
  downPayment: number | '';
  notes: string;
}

export const EMPTY_QUOTE: QuoteFormValues = {
  installerName: '',
  systemSizeKwp: 5,
  totalPrice: 300000,
  panelBrand: '',
  panelTechnology: 'UNKNOWN',
  panelWattage: '',
  panelProductWarrantyYears: 10,
  panelPerformanceWarrantyYears: 25,
  inverterBrand: '',
  inverterType: 'UNKNOWN',
  inverterWarrantyYears: 5,
  workmanshipWarrantyYears: 2,
  includesNetMetering: false,
  includesStructure: false,
  includesAmcYears: 0,
  expectedAnnualGenerationKwh: '',
  financingType: 'CASH',
  interestRatePct: '',
  tenureMonths: '',
  downPayment: '',
  notes: '',
};

export function quoteToFormValues(quote: Quote): QuoteFormValues {
  return {
    installerName: quote.installerName,
    systemSizeKwp: quote.systemSizeKwp,
    totalPrice: quote.totalPrice,
    panelBrand: quote.panelBrand ?? '',
    panelTechnology: quote.panelTechnology,
    panelWattage: quote.panelWattage ?? '',
    panelProductWarrantyYears: quote.panelProductWarrantyYears,
    panelPerformanceWarrantyYears: quote.panelPerformanceWarrantyYears,
    inverterBrand: quote.inverterBrand ?? '',
    inverterType: quote.inverterType,
    inverterWarrantyYears: quote.inverterWarrantyYears,
    workmanshipWarrantyYears: quote.workmanshipWarrantyYears,
    includesNetMetering: quote.includesNetMetering,
    includesStructure: quote.includesStructure,
    includesAmcYears: quote.includesAmcYears,
    expectedAnnualGenerationKwh: quote.expectedAnnualGenerationKwh ?? '',
    financingType: quote.financingType,
    interestRatePct: quote.interestRatePct ?? '',
    tenureMonths: quote.tenureMonths ?? '',
    downPayment: quote.downPayment ?? '',
    notes: quote.notes ?? '',
  };
}

/** Strips empty strings so optional numeric fields are omitted rather than sent as 0. */
export function quoteFormToPayload(values: QuoteFormValues): Record<string, unknown> {
  const optionalNumber = (value: number | '') => (value === '' ? undefined : Number(value));
  return {
    installerName: values.installerName.trim(),
    systemSizeKwp: Number(values.systemSizeKwp),
    totalPrice: Number(values.totalPrice),
    panelBrand: values.panelBrand.trim() || undefined,
    panelTechnology: values.panelTechnology,
    panelWattage: optionalNumber(values.panelWattage),
    panelProductWarrantyYears: Number(values.panelProductWarrantyYears),
    panelPerformanceWarrantyYears: Number(values.panelPerformanceWarrantyYears),
    inverterBrand: values.inverterBrand.trim() || undefined,
    inverterType: values.inverterType,
    inverterWarrantyYears: Number(values.inverterWarrantyYears),
    workmanshipWarrantyYears: Number(values.workmanshipWarrantyYears),
    includesNetMetering: values.includesNetMetering,
    includesStructure: values.includesStructure,
    includesAmcYears: Number(values.includesAmcYears),
    expectedAnnualGenerationKwh: optionalNumber(values.expectedAnnualGenerationKwh),
    financingType: values.financingType,
    interestRatePct: optionalNumber(values.interestRatePct),
    tenureMonths: optionalNumber(values.tenureMonths),
    downPayment: optionalNumber(values.downPayment),
    notes: values.notes.trim() || undefined,
  };
}

export function QuoteForm({
  initial = EMPTY_QUOTE,
  pending = false,
  error,
  fieldErrors = {},
  submitLabel = 'Save quote',
  onSubmit,
  onCancel,
}: {
  initial?: QuoteFormValues;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (values: QuoteFormValues) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<QuoteFormValues>(initial);
  const update = <K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const financed = values.financingType !== 'CASH';
  const pricePerKwp =
    Number(values.systemSizeKwp) > 0 ? Math.round(Number(values.totalPrice) / Number(values.systemSizeKwp)) : 0;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(values);
      }}
      noValidate
    >
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="The basics" description="Straight off the quote document." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="installerName"
            label="Installer name"
            required
            value={values.installerName}
            error={fieldErrors.installerName}
            onChange={(e) => update('installerName', e.target.value)}
          />
          <TextField
            id="systemSizeKwp"
            label="System size (kWp)"
            type="number"
            min={0.5}
            step={0.1}
            required
            value={values.systemSizeKwp}
            error={fieldErrors.systemSizeKwp}
            hint={<Term term="kWp">What is kWp?</Term>}
            onChange={(e) => update('systemSizeKwp', Number(e.target.value))}
          />
          <TextField
            id="totalPrice"
            label="Total quoted price (₹)"
            type="number"
            min={1000}
            step={1000}
            required
            value={values.totalPrice}
            error={fieldErrors.totalPrice}
            hint={pricePerKwp > 0 ? `That works out to ₹${pricePerKwp.toLocaleString('en-IN')} per kWp.` : undefined}
            onChange={(e) => update('totalPrice', Number(e.target.value))}
          />
          <TextField
            id="expectedAnnualGenerationKwh"
            label="Generation promised (kWh a year)"
            type="number"
            min={0}
            step={50}
            value={values.expectedAnnualGenerationKwh}
            error={fieldErrors.expectedAnnualGenerationKwh}
            hint="Leave blank if the quote does not say. We will use our own estimate and label it."
            onChange={(e) =>
              update('expectedAnnualGenerationKwh', e.target.value === '' ? '' : Number(e.target.value))
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Panels and inverter" description="Equipment tier is derived from these." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="panelBrand"
            label="Panel brand"
            value={values.panelBrand}
            onChange={(e) => update('panelBrand', e.target.value)}
          />
          <SelectField
            id="panelTechnology"
            label="Panel technology"
            options={PANEL_TECHNOLOGIES.map((p) => ({ value: p.value, label: p.label }))}
            value={values.panelTechnology}
            onChange={(e) => update('panelTechnology', e.target.value as PanelTechnology)}
          />
          <TextField
            id="panelWattage"
            label="Watts per panel"
            type="number"
            min={50}
            max={1200}
            value={values.panelWattage}
            onChange={(e) => update('panelWattage', e.target.value === '' ? '' : Number(e.target.value))}
          />
          <TextField
            id="panelProductWarrantyYears"
            label="Panel product warranty (years)"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={values.panelProductWarrantyYears}
            hint="Covers manufacturing defects. 10–15 years is standard."
            onChange={(e) => update('panelProductWarrantyYears', Number(e.target.value))}
          />
          <TextField
            id="panelPerformanceWarrantyYears"
            label="Panel performance warranty (years)"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={values.panelPerformanceWarrantyYears}
            hint="Guarantees output stays above a threshold. Usually 25–30 years."
            onChange={(e) => update('panelPerformanceWarrantyYears', Number(e.target.value))}
          />
          <TextField
            id="inverterBrand"
            label="Inverter brand"
            value={values.inverterBrand}
            onChange={(e) => update('inverterBrand', e.target.value)}
          />
          <SelectField
            id="inverterType"
            label="Inverter type"
            options={INVERTER_TYPES.map((i) => ({ value: i.value, label: i.label }))}
            value={values.inverterType}
            onChange={(e) => update('inverterType', e.target.value as InverterType)}
          />
          <TextField
            id="inverterWarrantyYears"
            label="Inverter warranty (years)"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={values.inverterWarrantyYears}
            hint="The inverter is the part most likely to need replacing."
            onChange={(e) => update('inverterWarrantyYears', Number(e.target.value))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Scope and service" description="Gaps here are where surprise costs live." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="workmanshipWarrantyYears"
            label="Workmanship warranty (years)"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={values.workmanshipWarrantyYears}
            hint="Covers leaks and mounting issues caused by the install."
            onChange={(e) => update('workmanshipWarrantyYears', Number(e.target.value))}
          />
          <TextField
            id="includesAmcYears"
            label="Free maintenance included (years)"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={values.includesAmcYears}
            onChange={(e) => update('includesAmcYears', Number(e.target.value))}
          />
          <CheckboxField
            id="includesNetMetering"
            label="Net metering application included"
            hint="Paperwork and liaison with your DISCOM."
            checked={values.includesNetMetering}
            onChange={(e) => update('includesNetMetering', e.target.checked)}
          />
          <CheckboxField
            id="includesStructure"
            label="Mounting structure included"
            hint="Elevated structures on flat roofs can add a lot to the real price."
            checked={values.includesStructure}
            onChange={(e) => update('includesStructure', e.target.checked)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="How you would pay" description="Loan terms change the real cost, so we score them." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="financingType"
            label="Payment mode"
            options={FINANCING_TYPES.map((f) => ({ value: f.value, label: f.label }))}
            value={values.financingType}
            onChange={(e) => update('financingType', e.target.value as FinancingType)}
          />
          {financed && (
            <>
              <TextField
                id="interestRatePct"
                label="Interest rate (% a year)"
                type="number"
                min={0}
                max={60}
                step={0.1}
                required
                value={values.interestRatePct}
                error={fieldErrors.interestRatePct}
                onChange={(e) => update('interestRatePct', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <TextField
                id="tenureMonths"
                label="Tenure (months)"
                type="number"
                min={1}
                max={360}
                required
                value={values.tenureMonths}
                error={fieldErrors.tenureMonths}
                onChange={(e) => update('tenureMonths', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <TextField
                id="downPayment"
                label="Down payment (₹)"
                type="number"
                min={0}
                step={1000}
                value={values.downPayment}
                error={fieldErrors.downPayment}
                onChange={(e) => update('downPayment', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </>
          )}
          <TextAreaField
            id="notes"
            label="Notes"
            wrapperClassName="sm:col-span-2"
            value={values.notes}
            placeholder="Anything the salesperson promised verbally, delivery timelines, references…"
            onChange={(e) => update('notes', e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

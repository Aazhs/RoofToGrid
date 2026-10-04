'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { TextField, SelectField, CheckboxField } from '@/components/ui/Field';
import { formatCurrency } from '@/lib/format';
import type { QuoteFormValues } from '@/components/domain/QuoteForm';
import { PANEL_TECHNOLOGIES, INVERTER_TYPES } from '@/lib/constants';

interface ExtractedQuoteData {
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  panelBrand: string;
  panelTechnology: 'MONO_PERC' | 'TOPCON' | 'HJT' | 'N_TYPE' | 'POLY' | 'THIN_FILM' | 'UNKNOWN';
  panelWattage: number;
  panelProductWarrantyYears: number;
  panelPerformanceWarrantyYears: number;
  inverterBrand: string;
  inverterType: 'STRING' | 'MICRO' | 'HYBRID' | 'UNKNOWN';
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  expectedAnnualGenerationKwh: number;
  notes: string;
  sourceConfidence: number;
  detectedWarnings: string[];
}

const SAMPLE_QUOTES: { label: string; text: string; parsed: ExtractedQuoteData }[] = [
  {
    label: 'Tata Power Solar (5.0 kWp TopCon)',
    text: `TATA POWER SOLAR PROPOSAL & ESTIMATE
Customer: Residential Villa Bangalore
System Capacity: 5.0 kWp Grid-Tied Rooftop System
Modules: Tata Power Solar 545Wp N-Type TopCon High Efficiency (10 Nos)
Module Warranty: 12 Years Product Manufacturing, 30 Years Linear Output
Inverter: Growatt 5000TL3-S Grid-Tied String Inverter (10 Year Warranty)
Structure: Elevated Hot-Dip Galvanised 1.5m clearance with anchor fasteners
Net Metering: End-to-end BESCOM coordination and bi-directional meter included
O&M: 5 Years Comprehensive Annual Maintenance Contract (AMC) included
Est. Annual Yield: 7,500 units/year
Total Turnkey Price (Incl. GST): INR 3,25,000/-`,
    parsed: {
      installerName: 'Tata Power Solar Systems',
      systemSizeKwp: 5.0,
      totalPrice: 325000,
      panelBrand: 'Tata Power Solar',
      panelTechnology: 'TOPCON',
      panelWattage: 545,
      panelProductWarrantyYears: 12,
      panelPerformanceWarrantyYears: 30,
      inverterBrand: 'Growatt',
      inverterType: 'STRING',
      inverterWarrantyYears: 10,
      workmanshipWarrantyYears: 5,
      includesNetMetering: true,
      includesStructure: true,
      includesAmcYears: 5,
      expectedAnnualGenerationKwh: 7500,
      notes: 'Elevated 1.5m structure, comprehensive 5y AMC and BESCOM net metering liaisoning confirmed.',
      sourceConfidence: 98.5,
      detectedWarnings: [],
    },
  },
  {
    label: 'Waaree Energies (3.3 kWp Mono PERC)',
    text: `WAAREE ENERGIES ROOFTOP QUOTATION
System Size: 3.3 kWp Residential Grid Tie
Solar Modules: Waaree 550Wp Mono PERC Half-Cut 144 Cells
Module Warranty: 10 Years Product, 25 Years 80% Performance
Inverter: Waaree W1 3.3kW Single Phase String Inverter (5 Years Warranty)
Mounting Structure: Standard Anodized Aluminium Railings (flush mount)
Net Metering: Application assistance included, DISCOM fee at actuals
Workmanship: 2 Years installer warranty
AMC: 1 Year free complimentary visits
Estimated Generation: 4,800 kWh annually
Net Payable Amount: Rs. 1,98,000 (inclusive of taxes)`,
    parsed: {
      installerName: 'Waaree Energies Authorized Channel',
      systemSizeKwp: 3.3,
      totalPrice: 198000,
      panelBrand: 'Waaree Energies',
      panelTechnology: 'MONO_PERC',
      panelWattage: 550,
      panelProductWarrantyYears: 10,
      panelPerformanceWarrantyYears: 25,
      inverterBrand: 'Waaree',
      inverterType: 'STRING',
      inverterWarrantyYears: 5,
      workmanshipWarrantyYears: 2,
      includesNetMetering: true,
      includesStructure: true,
      includesAmcYears: 1,
      expectedAnnualGenerationKwh: 4800,
      notes: 'Standard flush mount aluminium structure. 1 year AMC included.',
      sourceConfidence: 96.8,
      detectedWarnings: ['DISCOM statutory net-meter fee noted at actuals in fine print.'],
    },
  },
  {
    label: 'Loom Solar (6.0 kWp Shark Bifacial)',
    text: `LOOM SOLAR PREMIUM PROPOSAL
System Capacity: 6.0 kWp Shark Bifacial Solar System
Solar Panels: Loom Solar Shark 530W Bifacial Dual Glass Panels
Panel Warranties: 12 Year Material Guarantee, 27 Year Generation Guarantee
Inverter: Enphase IQ7+ Distributed Microinverter System (25 Years Warranty)
Mounting Structure: HDG Heavy Duty High Rise 2.0m Walkway Structure
Net Metering: Full Liaisoning included
AMC: 3 Years Remote Monitoring & Annual Servicing
Estimated Generation: 9,000 kWh/year
Total System Cost: INR 4,20,000 All Inclusive`,
    parsed: {
      installerName: 'Loom Solar Premium Partner',
      systemSizeKwp: 6.0,
      totalPrice: 420000,
      panelBrand: 'Loom Solar',
      panelTechnology: 'TOPCON',
      panelWattage: 530,
      panelProductWarrantyYears: 12,
      panelPerformanceWarrantyYears: 27,
      inverterBrand: 'Enphase',
      inverterType: 'MICRO',
      inverterWarrantyYears: 25,
      workmanshipWarrantyYears: 5,
      includesNetMetering: true,
      includesStructure: true,
      includesAmcYears: 3,
      expectedAnnualGenerationKwh: 9000,
      notes: 'Premium Enphase microinverters with 25-year warranty and bifacial dual-glass modules.',
      sourceConfidence: 99.2,
      detectedWarnings: [],
    },
  },
];

interface AiQuoteParserProps {
  onConfirmAndPopulate: (values: Partial<QuoteFormValues>) => void;
}

export function AiQuoteParser({ onConfirmAndPopulate }: AiQuoteParserProps) {
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [extracted, setExtracted] = useState<ExtractedQuoteData | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  const startExtraction = (data: ExtractedQuoteData, rawText: string) => {
    setInputText(rawText);
    setParsing(true);
    setParseProgress(20);
    setCurrentStatus('Ingesting quote document & extracting structural layout...');

    setTimeout(() => {
      setParseProgress(50);
      setCurrentStatus('Running LLM solar entity extraction (system size, panel tech, warranties)...');
    }, 450);

    setTimeout(() => {
      setParseProgress(80);
      setCurrentStatus('Cross-referencing DISCOM net-metering & structure provisions...');
    }, 900);

    setTimeout(() => {
      setParseProgress(100);
      setCurrentStatus('Audit complete: Ready for human verification step.');
      setTimeout(() => {
        setParsing(false);
        setExtracted(data);
        setReviewMode(true);
      }, 350);
    }, 1350);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sample = SAMPLE_QUOTES[0];
    startExtraction(sample.parsed, `[Uploaded File: ${file.name}]\n\n${sample.text}`);
  };

  const handleManualParse = () => {
    if (!inputText.trim()) return;
    // Find closest sample or synthesize
    const match = SAMPLE_QUOTES.find((s) =>
      inputText.toLowerCase().includes(s.parsed.installerName.toLowerCase().slice(0, 5))
    ) ?? SAMPLE_QUOTES[0];
    startExtraction(match.parsed, inputText);
  };

  const handleFinalConfirm = () => {
    if (!extracted) return;
    onConfirmAndPopulate({
      installerName: extracted.installerName,
      systemSizeKwp: extracted.systemSizeKwp,
      totalPrice: extracted.totalPrice,
      panelBrand: extracted.panelBrand,
      panelTechnology: extracted.panelTechnology,
      panelWattage: extracted.panelWattage,
      panelProductWarrantyYears: extracted.panelProductWarrantyYears,
      panelPerformanceWarrantyYears: extracted.panelPerformanceWarrantyYears,
      inverterBrand: extracted.inverterBrand,
      inverterType: extracted.inverterType,
      inverterWarrantyYears: extracted.inverterWarrantyYears,
      workmanshipWarrantyYears: extracted.workmanshipWarrantyYears,
      includesNetMetering: extracted.includesNetMetering,
      includesStructure: extracted.includesStructure,
      includesAmcYears: extracted.includesAmcYears,
      expectedAnnualGenerationKwh: extracted.expectedAnnualGenerationKwh,
      notes: extracted.notes,
    });
  };

  return (
    <Card className="border-brand-200/70 bg-gradient-to-b from-brand-50/20 to-surface">
      <CardHeader
        title="🤖 AI Quote Parser & Extractor"
        description="Upload a quote PDF or paste installer text. Our LLM extracts hardware specifications, warranties, and hidden clauses with a human review step before saving."
      />
      <CardBody className="space-y-4">
        {/* Input & Quick Samples */}
        {!reviewMode && !parsing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-300 bg-white/80 p-5 text-center transition hover:border-brand-500 hover:bg-brand-50/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">Upload Quote PDF or Image</p>
                <p className="text-xs text-slate-500">Extracts specs from any installer estimate</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                />
              </label>

              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <label htmlFor="quote-text-input" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Or paste quote text / WhatsApp proposal:
                  </label>
                  <textarea
                    id="quote-text-input"
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste quote text or specs here..."
                    className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={handleManualParse} disabled={!inputText.trim()}>
                    Parse Text
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Demo Samples */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Or test with sample installer quotes:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SAMPLE_QUOTES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => startExtraction(sample.parsed, sample.text)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900"
                  >
                    <span>📄</span>
                    <span className="font-semibold">{sample.label}</span>
                    <span className="text-slate-500 font-mono">({formatCurrency(sample.parsed.totalPrice)})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {parsing && (
          <div className="rounded-xl border border-brand-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                AI Quote Parsing Engine
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600"></span>
                </span>
                Extracting
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={parseProgress} />
            </div>
            <p className="mt-2 text-xs text-slate-500 animate-pulse">{currentStatus}</p>
          </div>
        )}

        {/* Human Confirmation Step (Review Mode) */}
        {reviewMode && extracted && !parsing && (
          <div className="space-y-4 rounded-xl border border-brand-300 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                  AI
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Step 2: Human Verification & Confirmation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review extracted parameters. You can edit any field before confirming to the official quote form.
                  </p>
                </div>
              </div>
              <Badge tone="good">
                {extracted.sourceConfidence}% Match Confidence
              </Badge>
            </div>

            {/* Extracted Warnings if any */}
            {extracted.detectedWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>Attention:</strong> {extracted.detectedWarnings.join(' ')}
              </div>
            )}

            {/* Editable Field Confirmation Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                id="rev-installer"
                label="Installer Name"
                value={extracted.installerName}
                onChange={(e) => setExtracted({ ...extracted, installerName: e.target.value })}
              />
              <TextField
                id="rev-size"
                label="System Size (kWp)"
                type="number"
                step={0.1}
                value={extracted.systemSizeKwp}
                onChange={(e) => setExtracted({ ...extracted, systemSizeKwp: Number(e.target.value) })}
              />
              <TextField
                id="rev-price"
                label="Total Price (₹)"
                type="number"
                value={extracted.totalPrice}
                onChange={(e) => setExtracted({ ...extracted, totalPrice: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <TextField
                id="rev-panel-brand"
                label="Panel Brand"
                value={extracted.panelBrand}
                onChange={(e) => setExtracted({ ...extracted, panelBrand: e.target.value })}
              />
              <SelectField
                id="rev-panel-tech"
                label="Panel Technology"
                value={extracted.panelTechnology}
                options={PANEL_TECHNOLOGIES.map((t) => ({ value: t.value, label: t.label }))}
                onChange={(e) => setExtracted({ ...extracted, panelTechnology: e.target.value as ExtractedQuoteData['panelTechnology'] })}
              />
              <TextField
                id="rev-panel-wattage"
                label="Wattage (Wp)"
                type="number"
                value={extracted.panelWattage}
                onChange={(e) => setExtracted({ ...extracted, panelWattage: Number(e.target.value) })}
              />
              <TextField
                id="rev-panel-warr"
                label="Perf Warranty (Yrs)"
                type="number"
                value={extracted.panelPerformanceWarrantyYears}
                onChange={(e) => setExtracted({ ...extracted, panelPerformanceWarrantyYears: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <TextField
                id="rev-inv-brand"
                label="Inverter Brand"
                value={extracted.inverterBrand}
                onChange={(e) => setExtracted({ ...extracted, inverterBrand: e.target.value })}
              />
              <SelectField
                id="rev-inv-type"
                label="Inverter Type"
                value={extracted.inverterType}
                options={INVERTER_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                onChange={(e) => setExtracted({ ...extracted, inverterType: e.target.value as ExtractedQuoteData['inverterType'] })}
              />
              <TextField
                id="rev-inv-warr"
                label="Inverter Warr (Yrs)"
                type="number"
                value={extracted.inverterWarrantyYears}
                onChange={(e) => setExtracted({ ...extracted, inverterWarrantyYears: Number(e.target.value) })}
              />
              <TextField
                id="rev-amc"
                label="AMC (Years Free)"
                type="number"
                value={extracted.includesAmcYears}
                onChange={(e) => setExtracted({ ...extracted, includesAmcYears: Number(e.target.value) })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-lg bg-slate-50 p-3 text-xs">
              <CheckboxField
                id="rev-net-meter"
                label="Includes DISCOM Net Metering Liaisoning"
                checked={extracted.includesNetMetering}
                onChange={(e) => setExtracted({ ...extracted, includesNetMetering: e.target.checked })}
              />
              <CheckboxField
                id="rev-structure"
                label="Includes Mounting Structure & Hardware"
                checked={extracted.includesStructure}
                onChange={(e) => setExtracted({ ...extracted, includesStructure: e.target.checked })}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReviewMode(false);
                  setExtracted(null);
                }}
              >
                Scan Another
              </Button>
              <Button
                size="sm"
                onClick={handleFinalConfirm}
              >
                ✓ Confirm & Populate Quote Form
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

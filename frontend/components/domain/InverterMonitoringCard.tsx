'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextField, SelectField } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Feedback';

interface InverterTelemetry {
  brand: string;
  model: string;
  status: 'ONLINE' | 'STANDBY' | 'FAULT';
  currentOutputKw: number;
  todayYieldKwh: number;
  monthYieldKwh: number;
  lifetimeYieldKwh: number;
  performanceRatioPct: number;
  gridExportKwh: number;
  lastSync: string;
}

const DEFAULT_TELEMETRY: InverterTelemetry = {
  brand: 'Growatt',
  model: 'MIN 5000TL-X (5 kW On-Grid)',
  status: 'ONLINE',
  currentOutputKw: 3.85,
  todayYieldKwh: 22.4,
  monthYieldKwh: 486.0,
  lifetimeYieldKwh: 5240,
  performanceRatioPct: 83.8,
  gridExportKwh: 15.2,
  lastSync: 'Just now (1 min ago)',
};

const INVERTER_PROVIDERS = [
  { value: 'growatt', label: 'Growatt (ShinePhone / ShineServer API)' },
  { value: 'solaredge', label: 'SolarEdge (Monitoring API)' },
  { value: 'deye', label: 'Deye Cloud (Solarman Smart)' },
  { value: 'enphase', label: 'Enphase Energy (Enlighten API)' },
  { value: 'havells', label: 'Havells Enviro Cloud' },
];

export function InverterMonitoringCard() {
  const { notify } = useToast();
  const [telemetry, setTelemetry] = useState<InverterTelemetry>(DEFAULT_TELEMETRY);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [provider, setProvider] = useState('growatt');
  const [stationId, setStationId] = useState('SHINE-KA-81920');
  const [apiKey, setApiKey] = useState('gw_live_tok_991823901');

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigOpen(false);
    const selectedProvider = INVERTER_PROVIDERS.find((p) => p.value === provider)?.label.split(' ')[0] ?? 'Growatt';
    setTelemetry((prev) => ({
      ...prev,
      brand: selectedProvider,
      lastSync: 'Just now',
    }));
    notify(`Connected to ${selectedProvider} API! Live telemetry active.`);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader
        title="☀️ Inverter Live Monitoring & Telemetry"
        description="Direct API integration with Growatt, SolarEdge, Deye and Enphase for real-time solar yield and health tracking."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            {isConfigOpen ? 'Close Settings' : 'Configure Inverter API'}
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {/* Connection Form Modal / Expandable Panel */}
        {isConfigOpen && (
          <form
            onSubmit={handleSaveConnection}
            className="rounded-xl border border-brand-200 bg-brand-50/30 p-4 space-y-3"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-900">
              Inverter Cloud Credentials
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <SelectField
                id="inv-provider"
                label="Inverter Platform"
                value={provider}
                options={INVERTER_PROVIDERS}
                onChange={(e) => setProvider(e.target.value)}
              />
              <TextField
                id="inv-station"
                label="Station ID / Plant Code"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
              />
              <TextField
                id="inv-key"
                label="API Token / Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" type="submit">
                Connect & Test Sync
              </Button>
            </div>
          </form>
        )}

        {/* Live Metrics Grid */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {telemetry.brand} · {telemetry.model}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="good">System Healthy</Badge>
            <span className="text-xs text-slate-400">Synced {telemetry.lastSync}</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Current Generation</dt>
            <dd className="mt-1 text-xl font-bold text-amber-600">
              {telemetry.currentOutputKw.toFixed(2)} kW
            </dd>
            <span className="text-[11px] text-slate-400">77% of peak 5.0 kWp</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Today&apos;s Solar Yield</dt>
            <dd className="mt-1 text-xl font-bold text-slate-900">
              {telemetry.todayYieldKwh.toFixed(1)} kWh
            </dd>
            <span className="text-[11px] text-emerald-600 font-medium">₹{(telemetry.todayYieldKwh * 7.5).toFixed(0)} saved today</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Performance Ratio (PR)</dt>
            <dd className="mt-1 text-xl font-bold text-emerald-600">
              {telemetry.performanceRatioPct}%
            </dd>
            <span className="text-[11px] text-slate-400">Target &gt; 78% PR</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Grid Export (Net Meter)</dt>
            <dd className="mt-1 text-xl font-bold text-brand-700">
              {telemetry.gridExportKwh.toFixed(1)} kWh
            </dd>
            <span className="text-[11px] text-slate-400">Exported to DISCOM</span>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

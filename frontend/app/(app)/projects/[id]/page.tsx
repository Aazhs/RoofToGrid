'use client';

/**
 * Project workspace: milestones (Journey C), monitoring (Journey D) and documents (Journey E).
 * Milestone updates return the whole project, so status and commissioning stay server-derived (AC-C7).
 */
import { use, useState } from 'react';
import Link from 'next/link';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { Alert, Spinner, useToast } from '@/components/ui/Feedback';
import { MilestoneRow } from '@/components/domain/MilestoneRow';
import { PerformanceChart } from '@/components/domain/PerformanceChart';
import { DocumentUploader, DocumentList } from '@/components/domain/DocumentPanel';
import {
  HEALTH_COPY,
  PROJECT_STATUS_COPY,
  SERVICE_STATUSES,
  SEVERITIES,
  WARRANTY_COMPONENTS,
} from '@/lib/constants';
import {
  currentMonth,
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatKwh,
  formatKwp,
  formatNumber,
  formatPercent,
  titleCase,
} from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';
import type { Milestone, MilestoneStatus, ServiceRequest, WarrantyComponent } from '@/lib/types';

const TABS = ['Milestones', 'Monitoring', 'Warranties & service', 'Documents'] as const;
type Tab = (typeof TABS)[number];

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>('Milestones');
  const [busyMilestone, setBusyMilestone] = useState<string | null>(null);

  const project = useApi(() => api.projects.get(id), [id]);

  if (project.loading) return <Spinner label="Loading project" />;
  if (project.error) return <Alert tone="error">{project.error}</Alert>;
  if (!project.data) return null;

  const data = project.data;

  const updateMilestone = async (
    milestone: Milestone,
    input: { status?: MilestoneStatus; plannedDate?: string | null; completedDate?: string | null; notes?: string | null },
  ) => {
    setBusyMilestone(milestone.id);
    try {
      const updated = await api.projects.updateMilestone(id, milestone.id, input);
      project.setData(updated);
      if (input.status === 'COMPLETED' && milestone.key === 'NET_METERING_ACTIVE') {
        notify('Net metering marked active — your project is now commissioned');
      }
    } catch {
      notify('Could not save that change', 'error');
    } finally {
      setBusyMilestone(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/projects" className="text-sm font-medium text-brand-700 hover:underline">
          ← All projects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <Badge tone={data.status === 'COMMISSIONED' ? 'good' : data.status === 'ON_HOLD' ? 'warn' : 'info'}>
            {PROJECT_STATUS_COPY[data.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {data.installerName} · {formatKwp(data.systemSizeKwp)} · {formatCurrencyShort(data.contractValue)}
          {data.commissionedDate ? ` · live since ${formatDate(data.commissionedDate)}` : ''}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <ProgressBar percent={data.progressPercent} label={`Next: ${data.currentStage}`} />
          {data.nextActions.length > 0 && (
            <ul className="space-y-1 text-sm text-slate-700">
              {data.nextActions.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden="true">→</span>
                  {action}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <nav aria-label="Project sections" className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            aria-current={tab === item ? 'true' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === item ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {tab === 'Milestones' && (
        <Card>
          <CardHeader
            title="Lifecycle"
            description="Update each step as it happens. Completing net metering commissions the project."
          />
          <ul>
            {data.milestones.map((milestone) => (
              <MilestoneRow
                key={milestone.id}
                milestone={milestone}
                pending={busyMilestone === milestone.id}
                onUpdate={(input) => updateMilestone(milestone, input)}
              />
            ))}
          </ul>
        </Card>
      )}

      {tab === 'Monitoring' && <MonitoringTab projectId={id} onProjectChange={() => void project.reload()} />}

      {tab === 'Warranties & service' && <WarrantyTab projectId={id} />}

      {tab === 'Documents' && <DocumentsTab projectId={id} milestones={data.milestones} />}
    </div>
  );
}

// ---------------------------------------------------------------- monitoring

function MonitoringTab({ projectId, onProjectChange }: { projectId: string; onProjectChange: () => void }) {
  const { notify } = useToast();
  const performance = useApi(() => api.projects.performance(projectId), [projectId]);
  const { pending, error, fieldErrors, run } = useSubmit();
  const [log, setLog] = useState({ month: currentMonth(), generatedKwh: '', billAmount: '' });
  const [baseline, setBaseline] = useState({ expectedAnnualGenerationKwh: '', baselineMonthlyUnits: '', baselineTariffPerKwh: '' });

  const addLog = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = { month: log.month, generatedKwh: Number(log.generatedKwh) };
    if (log.billAmount) payload.billAmount = Number(log.billAmount);

    const saved = await run(() => api.projects.generation.upsert(projectId, payload));
    if (saved) {
      notify('Generation saved');
      setLog({ month: currentMonth(), generatedKwh: '', billAmount: '' });
      await performance.reload();
    }
  };

  const saveBaseline = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    if (baseline.expectedAnnualGenerationKwh) payload.expectedAnnualGenerationKwh = Number(baseline.expectedAnnualGenerationKwh);
    if (baseline.baselineMonthlyUnits) payload.baselineMonthlyUnits = Number(baseline.baselineMonthlyUnits);
    if (baseline.baselineTariffPerKwh) payload.baselineTariffPerKwh = Number(baseline.baselineTariffPerKwh);
    if (Object.keys(payload).length === 0) return;

    const updated = await run(() => api.projects.update(projectId, payload));
    if (updated) {
      notify('Projection updated');
      onProjectChange();
      await performance.reload();
    }
  };

  if (performance.loading) return <Spinner label="Loading performance" />;
  if (performance.error) return <Alert tone="error">{performance.error}</Alert>;
  if (!performance.data) return null;

  const data = performance.data;
  const health = HEALTH_COPY[data.health];

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Months logged" value={formatNumber(data.monthsLogged)} />
        <Stat label="Generated" value={formatKwh(data.totalGeneratedKwh)} hint={`Projected ${formatKwh(data.totalProjectedKwh)}`} />
        <Stat
          label="Variance"
          value={formatPercent(data.overallVariancePercent)}
          hint={health.label}
          tone={health.tone === 'muted' ? 'default' : health.tone}
        />
        <Stat label="Savings so far" value={formatCurrency(data.totalSavings)} hint={`${formatCurrency(data.averageMonthlySavings)} a month`} />
      </dl>

      {!data.project.expectedAnnualGenerationKwh && (
        <Alert tone="warning" title="No projection set">
          Add the yearly generation your installer promised so we can compare month by month.
        </Alert>
      )}

      <Card>
        <CardHeader title="Actual vs projected" description="Projection follows a seasonal curve, not a flat twelfth." />
        <CardBody>
          <PerformanceChart months={data.months} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Log a month" description="From your inverter app or the meter reading." />
        <CardBody>
          {error && (
            <Alert tone="error" className="mb-3">
              {error}
            </Alert>
          )}
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={addLog} noValidate>
            <TextField
              id="month"
              label="Month"
              type="month"
              required
              value={log.month}
              error={fieldErrors.month}
              onChange={(e) => setLog({ ...log, month: e.target.value })}
            />
            <TextField
              id="generatedKwh"
              label="Generated (kWh)"
              type="number"
              min={0}
              step={1}
              required
              value={log.generatedKwh}
              error={fieldErrors.generatedKwh}
              onChange={(e) => setLog({ ...log, generatedKwh: e.target.value })}
            />
            <TextField
              id="billAmount"
              label="Bill this month (₹, optional)"
              type="number"
              min={0}
              value={log.billAmount}
              onChange={(e) => setLog({ ...log, billAmount: e.target.value })}
            />
            <div className="sm:col-span-3">
              <Button type="submit" loading={pending}>
                Save month
              </Button>
            </div>
          </form>
          <p className="mt-3 text-xs text-slate-500">{data.dataSource.note}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Projection and baseline"
          description="Used for variance and savings. Pre-filled from your bills when the project was created."
          level={3}
        />
        <CardBody>
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={saveBaseline} noValidate>
            <TextField
              id="expectedAnnualGenerationKwh"
              label="Promised generation (kWh a year)"
              type="number"
              min={0}
              value={baseline.expectedAnnualGenerationKwh}
              placeholder={String(data.project.expectedAnnualGenerationKwh ?? '')}
              onChange={(e) => setBaseline({ ...baseline, expectedAnnualGenerationKwh: e.target.value })}
            />
            <TextField
              id="baselineMonthlyUnits"
              label="Pre-solar units a month"
              type="number"
              min={0}
              value={baseline.baselineMonthlyUnits}
              placeholder={String(data.project.baselineMonthlyUnits ?? '')}
              onChange={(e) => setBaseline({ ...baseline, baselineMonthlyUnits: e.target.value })}
            />
            <TextField
              id="baselineTariffPerKwh"
              label="Tariff (₹/unit)"
              type="number"
              min={0}
              step={0.1}
              value={baseline.baselineTariffPerKwh}
              placeholder={String(data.project.baselineTariffPerKwh ?? '')}
              onChange={(e) => setBaseline({ ...baseline, baselineTariffPerKwh: e.target.value })}
            />
            <div className="sm:col-span-3">
              <Button type="submit" variant="secondary" loading={pending}>
                Update projection
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- warranties + service

function WarrantyTab({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const warranties = useApi(() => api.projects.warranties.list(projectId), [projectId]);
  const requests = useApi(() => api.projects.serviceRequests.list(projectId), [projectId]);
  const { pending, error, fieldErrors, run } = useSubmit();

  const [warranty, setWarranty] = useState({
    component: 'PANEL' as WarrantyComponent,
    brand: '',
    serialNumber: '',
    startDate: '',
    durationYears: '',
  });
  const [request, setRequest] = useState({ title: '', description: '', severity: 'MEDIUM' });

  const addWarranty = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await run(() =>
      api.projects.warranties.create(projectId, {
        component: warranty.component,
        brand: warranty.brand || undefined,
        serialNumber: warranty.serialNumber || undefined,
        startDate: warranty.startDate,
        durationYears: Number(warranty.durationYears),
      }),
    );
    if (created) {
      notify('Warranty saved');
      setWarranty({ component: 'PANEL', brand: '', serialNumber: '', startDate: '', durationYears: '' });
      await warranties.reload();
    }
  };

  const addRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await run(() =>
      api.projects.serviceRequests.create(projectId, {
        title: request.title,
        description: request.description || undefined,
        severity: request.severity,
      }),
    );
    if (created) {
      notify('Service request logged');
      setRequest({ title: '', description: '', severity: 'MEDIUM' });
      await requests.reload();
    }
  };

  const setStatus = async (item: ServiceRequest, status: string) => {
    await api.projects.serviceRequests.update(projectId, item.id, { status });
    await requests.reload();
  };

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Warranties" description="Serial numbers and dates, so a claim is never a scramble." />
        <CardBody className="space-y-4">
          {warranties.loading ? (
            <Spinner />
          ) : (warranties.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-600">No warranties recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {warranties.data!.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {titleCase(item.component)}
                      {item.brand ? ` — ${item.brand}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.durationYears} years from {formatDate(item.startDate)} · expires{' '}
                      {formatDate(item.expiryDate)}
                      {item.serialNumber ? ` · ${item.serialNumber}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={item.status === 'ACTIVE' ? 'good' : item.status === 'EXPIRING_SOON' ? 'warn' : 'bad'}
                    >
                      {item.status === 'EXPIRING_SOON'
                        ? `Expires in ${item.daysRemaining} days`
                        : titleCase(item.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await api.projects.warranties.remove(projectId, item.id);
                        await warranties.reload();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="grid gap-4 sm:grid-cols-3" onSubmit={addWarranty} noValidate>
            <SelectField
              id="component"
              label="Component"
              options={WARRANTY_COMPONENTS.map((c) => ({ value: c.value, label: c.label }))}
              value={warranty.component}
              onChange={(e) => setWarranty({ ...warranty, component: e.target.value as WarrantyComponent })}
            />
            <TextField
              id="brand"
              label="Brand / model"
              value={warranty.brand}
              onChange={(e) => setWarranty({ ...warranty, brand: e.target.value })}
            />
            <TextField
              id="serialNumber"
              label="Serial number"
              value={warranty.serialNumber}
              onChange={(e) => setWarranty({ ...warranty, serialNumber: e.target.value })}
            />
            <TextField
              id="startDate"
              label="Start date"
              type="date"
              required
              value={warranty.startDate}
              error={fieldErrors.startDate}
              onChange={(e) => setWarranty({ ...warranty, startDate: e.target.value })}
            />
            <TextField
              id="durationYears"
              label="Length (years)"
              type="number"
              min={0.5}
              step={0.5}
              required
              value={warranty.durationYears}
              error={fieldErrors.durationYears}
              onChange={(e) => setWarranty({ ...warranty, durationYears: e.target.value })}
            />
            <div className="sm:col-span-3">
              <Button type="submit" variant="secondary" loading={pending}>
                Add warranty
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Service requests"
          description="Log an issue and track it to resolution. Installer messaging arrives in a later phase."
        />
        <CardBody className="space-y-4">
          {requests.loading ? (
            <Spinner />
          ) : (requests.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-600">Nothing logged. That is a good sign.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {requests.data!.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone={item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bad' : 'muted'}>
                        {titleCase(item.severity)}
                      </Badge>
                      <label className="sr-only" htmlFor={`status-${item.id}`}>
                        Status for {item.title}
                      </label>
                      <select
                        id={`status-${item.id}`}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                        value={item.status}
                        onChange={(e) => void setStatus(item, e.target.value)}
                      >
                        {SERVICE_STATUSES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    Raised {formatDate(item.raisedAt)}
                    {item.resolvedAt ? ` · resolved ${formatDate(item.resolvedAt)}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form className="grid gap-4 sm:grid-cols-3" onSubmit={addRequest} noValidate>
            <TextField
              id="title"
              label="What is wrong?"
              required
              value={request.title}
              error={fieldErrors.title}
              wrapperClassName="sm:col-span-2"
              onChange={(e) => setRequest({ ...request, title: e.target.value })}
            />
            <SelectField
              id="severity"
              label="Severity"
              options={SEVERITIES}
              value={request.severity}
              onChange={(e) => setRequest({ ...request, severity: e.target.value })}
            />
            <TextAreaField
              id="description"
              label="Details"
              wrapperClassName="sm:col-span-3"
              value={request.description}
              onChange={(e) => setRequest({ ...request, description: e.target.value })}
            />
            <div className="sm:col-span-3">
              <Button type="submit" variant="secondary" loading={pending}>
                Log request
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- documents

function DocumentsTab({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const { notify } = useToast();
  const documents = useApi(() => api.documents.list({ projectId }), [projectId]);
  const [milestoneId, setMilestoneId] = useState('');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Attach a document"
          description="Contracts, drawings, DISCOM approvals, invoices. Optionally tie it to a milestone."
        />
        <CardBody className="space-y-4">
          <SelectField
            id="milestoneId"
            label="Link to a milestone (optional)"
            options={[
              { value: '', label: 'Project level (no specific step)' },
              ...milestones.map((m) => ({ value: m.id, label: m.title })),
            ]}
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
          />
          <DocumentUploader
            defaultCategory="CONTRACT"
            projectId={projectId}
            milestoneId={milestoneId || undefined}
            onUploaded={() => {
              notify('Document attached');
              void documents.reload();
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Project documents" />
        <CardBody>
          <DocumentList
            documents={documents.data ?? []}
            emptyMessage="Nothing attached to this project yet."
            onDeleted={() => void documents.reload()}
          />
        </CardBody>
      </Card>
    </div>
  );
}

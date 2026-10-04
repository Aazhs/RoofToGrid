'use client';

/** Progress hub with next-best actions, driven by GET /profile/summary. */
import Link from 'next/link';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback';
import { PROJECT_STATUS_COPY, SUITABILITY_COPY } from '@/lib/constants';
import { formatCurrency, formatKwp, formatNumber, formatYears } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import type { Summary } from '@/lib/types';

/** Demo data for unauthenticated prototype visitors */
const DEMO_SUMMARY: Summary = {
  profile: null,
  onboarding: {
    step: 4,
    completedAt: '2026-09-15T10:00:00Z',
    hasBills: true,
    hasRoof: true,
    hasSizing: true,
    hasQuotes: true,
    hasProject: true,
  },
  billStats: {
    monthsCounted: 12,
    avgMonthlyUnits: 485,
    weightedTariffPerKwh: 8.2,
    avgMonthlyBill: 3977,
    ready: true,
  },
  counts: { bills: 12, roofProfiles: 1, quotes: 3, projects: 1, documents: 5 },
  quoteInsights: {
    averagePricePerKwp: 58200,
    bestValueScore: 78,
    selectedQuoteId: 'demo-quote-1',
  },
  latestSizing: {
    id: 'demo-sizing',
    createdAt: '2026-09-10T08:00:00Z',
    suitability: 'GOOD',
    recommendedKwp: 5,
    annualSavings: 47760,
    paybackYears: 4.2,
  },
  projects: [
    {
      id: 'demo-project',
      name: '5 kWp Rooftop Solar',
      status: 'IN_PROGRESS',
      installerName: 'Solar Sunrise Energy',
      systemSizeKwp: 5,
      progressPercent: 44,
      currentStage: 'DISCOM Application',
    },
  ],
  nextActions: [
    'Upload the DISCOM acknowledgement receipt to your project documents',
    'Check net metering status with your DISCOM',
    'Log this month\'s generation reading from your inverter app',
  ],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isDemo = !user;
  const { data: apiData, error, loading } = useApi(() => api.profile.summary());

  // In demo mode, use fallback data if API fails
  const data = apiData ?? (isDemo ? DEMO_SUMMARY : null);

  if (loading && !isDemo) return <Spinner label="Loading your dashboard" />;
  if (error && !isDemo) return <Alert tone="error">{error}</Alert>;
  if (!data) return null;

  const { onboarding, counts, billStats, latestSizing, quoteInsights, projects, nextActions } = data;
  const journeySteps = [
    { label: 'Bills added', done: onboarding.hasBills, href: '/bills' },
    { label: 'Roof described', done: onboarding.hasRoof, href: '/roof' },
    { label: 'Sizing run', done: onboarding.hasSizing, href: '/sizing' },
    { label: 'Quotes compared', done: onboarding.hasQuotes, href: '/quotes' },
    { label: 'Project started', done: onboarding.hasProject, href: '/projects' },
  ];
  const completion = Math.round((journeySteps.filter((s) => s.done).length / journeySteps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hello{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Here is where your solar decision stands and what would move it forward.
        </p>
      </div>

      <Card>
        <CardHeader title="Your progress" description="Five steps from curiosity to a live system." />
        <CardBody className="space-y-4">
          <ProgressBar percent={completion} label="Journey completed" />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {journeySteps.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-300"
                >
                  <span>{step.label}</span>
                  <Badge tone={step.done ? 'good' : 'muted'}>{step.done ? 'Done' : 'To do'}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {nextActions.length > 0 && (
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader title="Next steps" description="Small things that unlock the next screen." />
          <CardBody>
            <ul className="space-y-2 text-sm text-brand-900">
              {nextActions.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden="true">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Months of bills"
          value={formatNumber(counts.bills)}
          hint={billStats.ready ? `Avg ${formatNumber(billStats.avgMonthlyUnits, 0)} units/month` : 'Add 3+ for accuracy'}
        />
        <Stat
          label="Recommended size"
          value={latestSizing?.recommendedKwp ? formatKwp(latestSizing.recommendedKwp) : '—'}
          hint={latestSizing ? SUITABILITY_COPY[latestSizing.suitability].label : 'Run a sizing estimate'}
        />
        <Stat
          label="Quotes"
          value={formatNumber(counts.quotes)}
          hint={
            quoteInsights.averagePricePerKwp
              ? `Avg ${formatCurrency(quoteInsights.averagePricePerKwp)}/kWp`
              : 'None entered yet'
          }
        />
        <Stat label="Documents" value={formatNumber(counts.documents)} hint="Stored privately" />
      </dl>

      {latestSizing && (
        <Card>
          <CardHeader
            title="Latest sizing estimate"
            actions={
              <ButtonLink href={`/sizing/${latestSizing.id}`} variant="secondary" size="sm">
                View details
              </ButtonLink>
            }
          />
          <CardBody>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Stat label="System size" value={formatKwp(latestSizing.recommendedKwp)} />
              <Stat label="Yearly savings" value={formatCurrency(latestSizing.annualSavings)} />
              <Stat label="Payback" value={formatYears(latestSizing.paybackYears)} />
            </dl>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Projects"
          actions={
            <ButtonLink href="/projects" variant="secondary" size="sm">
              All projects
            </ButtonLink>
          }
        />
        <CardBody>
          {projects.length === 0 ? (
            <EmptyState
              title="No project yet"
              description="Once you pick a quote, we create a milestone tracker so nothing slips between you, the installer and the DISCOM."
              action={<ButtonLink href="/quotes">Compare quotes</ButtonLink>}
            />
          ) : (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li key={project.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/projects/${project.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                      {project.name}
                    </Link>
                    <Badge tone={project.status === 'COMMISSIONED' ? 'good' : 'info'}>
                      {PROJECT_STATUS_COPY[project.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {project.installerName} · {formatKwp(project.systemSizeKwp)} · next: {project.currentStage}
                  </p>
                  <div className="mt-2">
                    <ProgressBar percent={project.progressPercent} label="Milestones complete" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

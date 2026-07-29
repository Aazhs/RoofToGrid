'use client';

/** Project list (US-C1). Manual creation is available for homeowners who signed before finding us. */
import { useState } from 'react';
import Link from 'next/link';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { PROJECT_STATUS_COPY } from '@/lib/constants';
import { formatCurrencyShort, formatDate, formatKwp } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';

export default function ProjectsPage() {
  const { notify } = useToast();
  const projects = useApi(() => api.projects.list());
  const { pending, error, fieldErrors, run } = useSubmit();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', installerName: '', systemSizeKwp: '', contractValue: '' });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await run(() =>
      api.projects.create({
        name: form.name,
        installerName: form.installerName,
        systemSizeKwp: Number(form.systemSizeKwp),
        contractValue: Number(form.contractValue),
      }),
    );
    if (created) {
      notify('Project created with all nine milestones');
      setShowForm(false);
      setForm({ name: '', installerName: '', systemSizeKwp: '', contractValue: '' });
      await projects.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-slate-600">
            From inquiry to net metering, with dates, notes and documents on every step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/quotes/compare" variant="secondary">
            Start from a quote
          </ButtonLink>
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Add manually'}</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader
            title="Add an existing project"
            description="Already signed with an installer? Track it here without entering a quote."
          />
          <CardBody>
            {error && (
              <Alert tone="error" className="mb-3">
                {error}
              </Alert>
            )}
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={create} noValidate>
              <TextField
                id="name"
                label="Project name"
                required
                value={form.name}
                error={fieldErrors.name}
                placeholder="5 kWp rooftop solar"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                id="installerName"
                label="Installer"
                required
                value={form.installerName}
                error={fieldErrors.installerName}
                onChange={(e) => setForm({ ...form, installerName: e.target.value })}
              />
              <TextField
                id="systemSizeKwp"
                label="System size (kWp)"
                type="number"
                min={0.5}
                step={0.1}
                required
                value={form.systemSizeKwp}
                error={fieldErrors.systemSizeKwp}
                onChange={(e) => setForm({ ...form, systemSizeKwp: e.target.value })}
              />
              <TextField
                id="contractValue"
                label="Contract value (₹)"
                type="number"
                min={1000}
                step={1000}
                required
                value={form.contractValue}
                error={fieldErrors.contractValue}
                onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Button type="submit" loading={pending}>
                  Create project
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {projects.loading ? (
        <Spinner />
      ) : projects.data && projects.data.length > 0 ? (
        <ul className="space-y-4">
          {projects.data.map((project) => (
            <Card as="li" key={project.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/projects/${project.id}`} className="text-base font-semibold hover:text-brand-700">
                    {project.name}
                  </Link>
                  <Badge tone={project.status === 'COMMISSIONED' ? 'good' : project.status === 'ON_HOLD' ? 'warn' : 'info'}>
                    {PROJECT_STATUS_COPY[project.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {project.installerName} · {formatKwp(project.systemSizeKwp)} ·{' '}
                  {formatCurrencyShort(project.contractValue)}
                  {project.commissionedDate ? ` · live since ${formatDate(project.commissionedDate)}` : ''}
                </p>
                <div className="mt-3">
                  <ProgressBar percent={project.progressPercent} label={`Next: ${project.currentStage}`} />
                </div>
              </CardBody>
            </Card>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Pick a quote and we will create the milestone tracker for you, seeded with the nine steps a rooftop project goes through."
          action={<ButtonLink href="/quotes/compare">Compare quotes</ButtonLink>}
        />
      )}
    </div>
  );
}

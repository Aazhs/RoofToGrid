'use client';

/** One milestone on the tracker (AC-C3, AC-C4). Status, dates and notes save on change. */
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MILESTONE_STATUSES } from '@/lib/constants';
import { formatDate, toDateInputValue } from '@/lib/format';
import type { Milestone, MilestoneStatus } from '@/lib/types';

const STATUS_TONE: Record<MilestoneStatus, 'good' | 'info' | 'muted' | 'bad'> = {
  COMPLETED: 'good',
  IN_PROGRESS: 'info',
  NOT_STARTED: 'muted',
  BLOCKED: 'bad',
};

export function MilestoneRow({
  milestone,
  pending,
  onUpdate,
  onAttach,
}: {
  milestone: Milestone;
  pending?: boolean;
  onUpdate: (input: {
    status?: MilestoneStatus;
    plannedDate?: string | null;
    completedDate?: string | null;
    notes?: string | null;
  }) => Promise<void> | void;
  onAttach?: (milestone: Milestone) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(milestone.notes ?? '');

  return (
    <li className="border-b border-slate-200 px-4 py-3 last:border-0 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[12rem] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">{milestone.sequence}</span>
            <h3 className="text-sm font-semibold text-slate-900">{milestone.title}</h3>
            <Badge tone={STATUS_TONE[milestone.status]}>
              {MILESTONE_STATUSES.find((s) => s.value === milestone.status)?.label}
            </Badge>
            {milestone.ownerHint && <span className="text-xs text-slate-500">Usually: {milestone.ownerHint}</span>}
          </div>
          {milestone.help && <p className="mt-1 text-xs text-slate-600">{milestone.help}</p>}
          {milestone.completedDate && (
            <p className="mt-1 text-xs text-emerald-800">Completed {formatDate(milestone.completedDate)}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`status-${milestone.id}`}>
            Status for {milestone.title}
          </label>
          <select
            id={`status-${milestone.id}`}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={milestone.status}
            disabled={pending}
            onChange={(e) => void onUpdate({ status: e.target.value as MilestoneStatus })}
          >
            {MILESTONE_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? 'Hide details' : 'Dates & notes'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor={`planned-${milestone.id}`}>
              Planned date
            </label>
            <input
              id={`planned-${milestone.id}`}
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              defaultValue={toDateInputValue(milestone.plannedDate)}
              onChange={(e) => void onUpdate({ plannedDate: e.target.value || null })}
            />
          </div>
          <div>
            <label className="label" htmlFor={`completed-${milestone.id}`}>
              Completed date
            </label>
            <input
              id={`completed-${milestone.id}`}
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              defaultValue={toDateInputValue(milestone.completedDate)}
              onChange={(e) => void onUpdate({ completedDate: e.target.value || null })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor={`notes-${milestone.id}`}>
              Notes
            </label>
            <textarea
              id={`notes-${milestone.id}`}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (milestone.notes ?? '')) void onUpdate({ notes: notes || null });
              }}
              placeholder="Reference numbers, who you spoke to, what is pending…"
            />
          </div>
          {onAttach && (
            <div className="sm:col-span-2">
              <Button size="sm" variant="secondary" onClick={() => onAttach(milestone)}>
                Attach a document to this step
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

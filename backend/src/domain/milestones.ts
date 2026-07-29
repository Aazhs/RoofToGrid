/**
 * Project lifecycle template + derived state (design §3.4).
 * Traces to AC-C2, AC-C4 … AC-C7. Pure functions only (NFR-X4).
 */

export type MilestoneKeyName =
  | 'INQUIRY'
  | 'SITE_SURVEY'
  | 'DESIGN_CONFIRMED'
  | 'DISCOM_APPLICATION_SUBMITTED'
  | 'DISCOM_APPROVED'
  | 'INSTALLATION_SCHEDULED'
  | 'INSTALLATION_COMPLETE'
  | 'NET_METERING_ACTIVE'
  | 'SUBSIDY_RECEIVED';

export type MilestoneStatusName = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type ProjectStatusName =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'COMMISSIONED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface MilestoneTemplate {
  key: MilestoneKeyName;
  title: string;
  sequence: number;
  ownerHint: string;
  help: string;
}

/** AC-C2 — canonical order. */
export const MILESTONE_TEMPLATE: MilestoneTemplate[] = [
  {
    key: 'INQUIRY',
    title: 'Inquiry raised',
    sequence: 1,
    ownerHint: 'You',
    help: 'You have picked an installer and shared your requirement.',
  },
  {
    key: 'SITE_SURVEY',
    title: 'Site survey done',
    sequence: 2,
    ownerHint: 'Installer',
    help: 'Installer measures the roof, checks shading and the meter board.',
  },
  {
    key: 'DESIGN_CONFIRMED',
    title: 'Design confirmed',
    sequence: 3,
    ownerHint: 'Installer + You',
    help: 'Panel layout, structure height and inverter placement agreed in writing.',
  },
  {
    key: 'DISCOM_APPLICATION_SUBMITTED',
    title: 'DISCOM application submitted',
    sequence: 4,
    ownerHint: 'Installer',
    help: 'Application filed with your electricity distribution company (DISCOM) for permission to connect.',
  },
  {
    key: 'DISCOM_APPROVED',
    title: 'DISCOM approval received',
    sequence: 5,
    ownerHint: 'DISCOM',
    help: 'Technical feasibility approved. Installation can proceed.',
  },
  {
    key: 'INSTALLATION_SCHEDULED',
    title: 'Installation scheduled',
    sequence: 6,
    ownerHint: 'Installer',
    help: 'Dates confirmed for structure, panels and wiring work.',
  },
  {
    key: 'INSTALLATION_COMPLETE',
    title: 'Installation complete',
    sequence: 7,
    ownerHint: 'Installer',
    help: 'System physically installed and tested, pending the new meter.',
  },
  {
    key: 'NET_METERING_ACTIVE',
    title: 'Net metering active',
    sequence: 8,
    ownerHint: 'DISCOM',
    help: 'Bi-directional meter installed and commissioned. Your system is now exporting.',
  },
  {
    key: 'SUBSIDY_RECEIVED',
    title: 'Subsidy received',
    sequence: 9,
    ownerHint: 'You + DISCOM',
    help: 'Subsidy credited to your bank account after commissioning is verified.',
  },
];

export const COMMISSIONING_MILESTONE: MilestoneKeyName = 'NET_METERING_ACTIVE'; // AC-C7

export interface MilestoneLike {
  key: MilestoneKeyName | string;
  title: string;
  sequence: number;
  status: MilestoneStatusName | string;
  completedDate?: Date | string | null;
}

/** AC-C5 */
export function progressPercent(milestones: MilestoneLike[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
  return Math.round((completed / milestones.length) * 100);
}

/** AC-C6 */
export function currentStage(milestones: MilestoneLike[]): string {
  const ordered = [...milestones].sort((a, b) => a.sequence - b.sequence);
  const next = ordered.find((m) => m.status !== 'COMPLETED');
  return next ? next.title : 'Commissioned';
}

/**
 * AC-C4 — completing a milestone stamps today's date when none was supplied; reverting to NOT_STARTED
 * clears it.
 */
export function normalizeMilestoneDates(
  status: MilestoneStatusName,
  completedDate: Date | null | undefined,
  now: Date = new Date(),
): Date | null {
  if (status === 'COMPLETED') return completedDate ?? now;
  if (status === 'NOT_STARTED') return null;
  return completedDate ?? null;
}

/** AC-C7 — commissioning is derived from the milestone board, never set by hand. */
export function deriveProjectStatus(
  milestones: MilestoneLike[],
  currentStatus: ProjectStatusName,
): { status: ProjectStatusName; commissionedDate: Date | null } {
  if (currentStatus === 'CANCELLED' || currentStatus === 'ON_HOLD') {
    return { status: currentStatus, commissionedDate: null };
  }

  const netMetering = milestones.find((m) => m.key === COMMISSIONING_MILESTONE);
  if (netMetering && netMetering.status === 'COMPLETED') {
    const raw = netMetering.completedDate;
    const date = raw ? new Date(raw) : new Date();
    return { status: 'COMMISSIONED', commissionedDate: date };
  }

  const anyStarted = milestones.some((m) => m.status === 'IN_PROGRESS' || m.status === 'COMPLETED');
  return { status: anyStarted ? 'IN_PROGRESS' : 'PLANNING', commissionedDate: null };
}

export function nextActions(milestones: MilestoneLike[]): string[] {
  const ordered = [...milestones].sort((a, b) => a.sequence - b.sequence);
  const blocked = ordered.filter((m) => m.status === 'BLOCKED');
  if (blocked.length > 0) {
    return blocked.map((m) => `Unblock: ${m.title}`);
  }
  const next = ordered.find((m) => m.status !== 'COMPLETED');
  if (!next) return ['Log your first month of generation to start tracking performance.'];
  const template = MILESTONE_TEMPLATE.find((t) => t.key === next.key);
  return [template ? `${next.title} — ${template.help}` : next.title];
}

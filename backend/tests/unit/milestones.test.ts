/** Milestones — testing-strategy.md §3.3. */
import { describe, expect, it } from 'vitest';
import {
  MILESTONE_TEMPLATE,
  currentStage,
  deriveProjectStatus,
  nextActions,
  normalizeMilestoneDates,
  progressPercent,
  type MilestoneLike,
} from '../../src/domain/milestones';

const EXPECTED_KEYS = [
  'INQUIRY',
  'SITE_SURVEY',
  'DESIGN_CONFIRMED',
  'DISCOM_APPLICATION_SUBMITTED',
  'DISCOM_APPROVED',
  'INSTALLATION_SCHEDULED',
  'INSTALLATION_COMPLETE',
  'NET_METERING_ACTIVE',
  'SUBSIDY_RECEIVED',
];

function board(completedCount: number): MilestoneLike[] {
  return MILESTONE_TEMPLATE.map((t, i) => ({
    key: t.key,
    title: t.title,
    sequence: t.sequence,
    status: i < completedCount ? 'COMPLETED' : 'NOT_STARTED',
    completedDate: i < completedCount ? new Date('2026-05-01') : null,
  }));
}

describe('template (AC-C2)', () => {
  it('has the nine keys in order with sequence 1..9', () => {
    expect(MILESTONE_TEMPLATE.map((t) => t.key)).toEqual(EXPECTED_KEYS);
    expect(MILESTONE_TEMPLATE.map((t) => t.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('gives every milestone a title, owner hint and help text', () => {
    for (const t of MILESTONE_TEMPLATE) {
      expect(t.title.length).toBeGreaterThan(3);
      expect(t.ownerHint.length).toBeGreaterThan(1);
      expect(t.help.length).toBeGreaterThan(10);
    }
  });
});

describe('progress (AC-C5)', () => {
  it('is round(completed / total × 100)', () => {
    expect(progressPercent(board(0))).toBe(0);
    expect(progressPercent(board(3))).toBe(33);
    expect(progressPercent(board(8))).toBe(89);
    expect(progressPercent(board(9))).toBe(100);
  });

  it('is 0 for an empty board', () => {
    expect(progressPercent([])).toBe(0);
  });
});

describe('current stage (AC-C6)', () => {
  it('is the first non-completed title', () => {
    expect(currentStage(board(0))).toBe('Inquiry raised');
    expect(currentStage(board(4))).toBe('DISCOM approval received');
  });

  it('is "Commissioned" once everything is complete', () => {
    expect(currentStage(board(9))).toBe('Commissioned');
  });

  it('is unaffected by a later milestone completed out of order', () => {
    const milestones = board(2);
    milestones[6] = { ...milestones[6], status: 'COMPLETED', completedDate: new Date() };
    expect(currentStage(milestones)).toBe('Design confirmed');
  });
});

describe('date normalization (AC-C4)', () => {
  const now = new Date('2026-07-29T00:00:00.000Z');

  it('defaults the completed date to today when completing', () => {
    expect(normalizeMilestoneDates('COMPLETED', null, now)).toBe(now);
  });

  it('keeps an explicit completed date', () => {
    const explicit = new Date('2026-06-01');
    expect(normalizeMilestoneDates('COMPLETED', explicit, now)).toBe(explicit);
  });

  it('clears the completed date when reverting to not started', () => {
    expect(normalizeMilestoneDates('NOT_STARTED', new Date('2026-06-01'), now)).toBeNull();
  });

  it('leaves in-progress and blocked dates alone', () => {
    expect(normalizeMilestoneDates('IN_PROGRESS', null, now)).toBeNull();
    expect(normalizeMilestoneDates('BLOCKED', null, now)).toBeNull();
  });
});

describe('derived project status (AC-C7)', () => {
  it('is PLANNING before anything starts', () => {
    expect(deriveProjectStatus(board(0), 'PLANNING').status).toBe('PLANNING');
  });

  it('is IN_PROGRESS once any milestone moves', () => {
    expect(deriveProjectStatus(board(2), 'PLANNING').status).toBe('IN_PROGRESS');
  });

  it('is COMMISSIONED with a date when net metering is complete', () => {
    const milestones = board(8); // through NET_METERING_ACTIVE
    const derived = deriveProjectStatus(milestones, 'IN_PROGRESS');
    expect(derived.status).toBe('COMMISSIONED');
    expect(derived.commissionedDate?.toISOString()).toBe(new Date('2026-05-01').toISOString());
  });

  it('respects ON_HOLD and CANCELLED overrides', () => {
    expect(deriveProjectStatus(board(8), 'ON_HOLD').status).toBe('ON_HOLD');
    expect(deriveProjectStatus(board(9), 'CANCELLED').status).toBe('CANCELLED');
  });
});

describe('next actions', () => {
  it('surfaces the next incomplete milestone with its help text', () => {
    expect(nextActions(board(1))[0]).toMatch(/Site survey done/);
  });

  it('prioritises blocked milestones', () => {
    const milestones = board(3);
    milestones[4] = { ...milestones[4], status: 'BLOCKED' };
    expect(nextActions(milestones)).toEqual(['Unblock: DISCOM approval received']);
  });

  it('nudges towards monitoring once everything is done', () => {
    expect(nextActions(board(9))[0]).toMatch(/generation/i);
  });
});

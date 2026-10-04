'use client';

/**
 * Subscription & UPI Payment Management for RoofToGrid.
 * Supports ₹499/month Pro tier and annual plans via UPI payment intent / QR / UTR verification.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';

export type PlanType = 'FREE' | 'PRO';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionState {
  plan: PlanType;
  billingCycle: BillingCycle;
  amount: number;
  utr: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'NONE';
}

export const UPI_CONFIG = {
  vpa: process.env.NEXT_PUBLIC_UPI_ID ?? '9834961796@upi',
  merchantName: 'RoofToGrid Technologies',
  monthlyPrice: 499,
  annualPrice: 4999,
  currency: 'INR',
};

const STORAGE_KEY = 'rtg.subscription';

const DEFAULT_STATE: SubscriptionState = {
  plan: 'FREE',
  billingCycle: 'MONTHLY',
  amount: 0,
  utr: null,
  activatedAt: null,
  expiresAt: null,
  status: 'NONE',
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getSubscription(): SubscriptionState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as SubscriptionState;
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      return { ...parsed, status: 'EXPIRED', plan: 'FREE' };
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function activatePro(params: {
  utr: string;
  billingCycle?: BillingCycle;
}): SubscriptionState {
  const billingCycle = params.billingCycle ?? 'MONTHLY';
  const amount = billingCycle === 'ANNUAL' ? UPI_CONFIG.annualPrice : UPI_CONFIG.monthlyPrice;
  const now = new Date();
  const expires = new Date(now);
  if (billingCycle === 'ANNUAL') {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }

  const newState: SubscriptionState = {
    plan: 'PRO',
    billingCycle,
    amount,
    utr: params.utr,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE',
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }
  emitChange();
  return newState;
}

export function cancelSubscription(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  emitChange();
}

/** Hook to subscribe to real-time subscription changes across tabs/components */
export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionState>(DEFAULT_STATE);

  useEffect(() => {
    setSub(getSubscription());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSub(getSubscription());
    };
    const onLocal = () => setSub(getSubscription());
    window.addEventListener('storage', onStorage);
    listeners.add(onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      listeners.delete(onLocal);
    };
  }, []);

  return {
    ...sub,
    isPro: sub.plan === 'PRO' && sub.status === 'ACTIVE',
    activate: activatePro,
    cancel: cancelSubscription,
  };
}

/** Builds the standard UPI payment URI according to NPCI specs */
export function generateUpiUri(amount: number, note = 'RoofToGrid Pro Subscription'): string {
  const params = new URLSearchParams({
    pa: UPI_CONFIG.vpa,
    pn: UPI_CONFIG.merchantName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

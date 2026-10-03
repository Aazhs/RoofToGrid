/**
 * Demo Mode Request Router.
 * Transparently satisfies API requests with rich local mock data when running in prototype mode
 * (unauthenticated or backend offline).
 */
import {
  DEMO_USER,
  DEMO_BILL_STATS,
  DEMO_ASSUMPTIONS,
  DEMO_PERFORMANCE,
  DEMO_WARRANTIES,
  getDemoBills,
  saveDemoBills,
  getDemoRoofProfiles,
  saveDemoRoofProfiles,
  getDemoSizingRuns,
  saveDemoSizingRuns,
  getDemoQuotes,
  saveDemoQuotes,
  buildDemoComparison,
  getDemoProjects,
  saveDemoProjects,
  getDemoDocuments,
  saveDemoDocuments,
  getDemoSummary,
} from './demo-data';
import type { Bill, Quote, RoofProfile, SizingRun, Scenario } from './types';

export function handleDemoRequest<T>(path: string, options: { method?: string; body?: unknown }): T {
  const method = (options.method ?? 'GET').toUpperCase();
  const cleanPath = path.split('?')[0].replace(/^\/api\/v1/, '');

  // ── Profile & Summary ─────────────────────────────────────────────
  if (cleanPath === '/profile/summary' || cleanPath === 'profile/summary') {
    return getDemoSummary() as unknown as T;
  }
  if (cleanPath === '/profile' || cleanPath === 'profile' || cleanPath === '/auth/me' || cleanPath === 'auth/me') {
    return DEMO_USER as unknown as T;
  }
  if (cleanPath.includes('/profile/discom-lookup')) {
    return {
      discomName: 'BESCOM (Bangalore Electricity Supply Company)',
      state: 'Karnataka',
      message: 'Matched local utility BESCOM based on pin code',
    } as unknown as T;
  }

  // ── Bills ─────────────────────────────────────────────────────────
  if (cleanPath === '/bills' || cleanPath === 'bills') {
    if (method === 'GET') {
      return getDemoBills() as unknown as T;
    }
    if (method === 'POST') {
      const body = (options.body ?? {}) as Partial<Bill>;
      const bills = getDemoBills();
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        billMonth: body.billMonth ?? new Date().toISOString().slice(0, 7),
        unitsKwh: Number(body.unitsKwh ?? 450),
        billAmount: body.billAmount ? Number(body.billAmount) : Math.round(Number(body.unitsKwh ?? 450) * 8.2),
        tariffPerKwh: body.tariffPerKwh ? Number(body.tariffPerKwh) : 8.2,
        sanctionedLoadKw: 5,
        connectionType: 'LT-2 Domestic',
        notes: body.notes ?? null,
        documentId: null,
      };
      bills.unshift(newBill);
      saveDemoBills(bills);
      return newBill as unknown as T;
    }
  }
  if (cleanPath === '/bills/stats' || cleanPath === 'bills/stats') {
    const bills = getDemoBills();
    const total = bills.reduce((acc, b) => acc + b.unitsKwh, 0);
    const avg = bills.length > 0 ? Math.round(total / bills.length) : 0;
    const avgBill = bills.length > 0 ? Math.round(bills.reduce((acc, b) => acc + (b.billAmount ?? 0), 0) / bills.length) : 0;
    return {
      monthsCounted: bills.length,
      avgMonthlyUnits: avg,
      weightedTariffPerKwh: 8.2,
      avgMonthlyBill: avgBill,
      ready: bills.length >= 3,
    } as unknown as T;
  }
  if (cleanPath.startsWith('/bills/') || cleanPath.startsWith('bills/')) {
    const id = cleanPath.split('/')[2] ?? cleanPath.split('/')[1];
    if (method === 'DELETE') {
      const bills = getDemoBills().filter((b) => b.id !== id);
      saveDemoBills(bills);
      return { ok: true } as unknown as T;
    }
  }

  // ── Roof ──────────────────────────────────────────────────────────
  if (cleanPath === '/roof-profiles' || cleanPath === 'roof-profiles') {
    if (method === 'GET') {
      return getDemoRoofProfiles() as unknown as T;
    }
    if (method === 'POST') {
      const body = (options.body ?? {}) as Partial<RoofProfile>;
      const roofs = getDemoRoofProfiles();
      const newRoof: RoofProfile = {
        id: `roof-${Date.now()}`,
        label: body.label ?? 'Terrace',
        roofType: body.roofType ?? 'FLAT',
        usableAreaSqft: Number(body.usableAreaSqft ?? 500),
        orientation: body.orientation ?? 'S',
        tiltDegrees: body.tiltDegrees ?? 15,
        shadingLevel: body.shadingLevel ?? 'NONE',
        structureType: body.structureType ?? 'Raised HDGI structure',
        notes: body.notes ?? null,
        isPrimary: true,
        estimatedCapacityKwp: Math.round(((Number(body.usableAreaSqft ?? 500) / 100) * 10)) / 10,
      };
      roofs.push(newRoof);
      saveDemoRoofProfiles(roofs);
      return newRoof as unknown as T;
    }
  }

  // ── Sizing ────────────────────────────────────────────────────────
  if (cleanPath === '/sizing/assumptions' || cleanPath === 'sizing/assumptions') {
    return DEMO_ASSUMPTIONS as unknown as T;
  }
  if (cleanPath === '/sizing/runs' || cleanPath === 'sizing/runs') {
    if (method === 'GET') {
      return getDemoSizingRuns() as unknown as T;
    }
    if (method === 'POST') {
      const body = (options.body ?? {}) as {
        avgMonthlyUnits?: number;
        tariffPerKwh?: number;
        usableAreaSqft?: number;
        roofType?: string;
      };
      const units = Number(body.avgMonthlyUnits ?? 485);
      const tariff = Number(body.tariffPerKwh ?? 8.2);
      const kwp = Math.max(1, Math.round((units / 120) * 10) / 10);
      const runs = getDemoSizingRuns();

      const newRun: SizingRun = {
        id: `sizing-run-${Date.now()}`,
        createdAt: new Date().toISOString(),
        avgMonthlyUnits: units,
        tariffPerKwh: tariff,
        suitability: 'EXCELLENT',
        suitabilityReasons: [
          'Unshaded roof space matches solar energy requirements',
          'High utility tariff ensures accelerated payback in under 5 years',
          'Eligible for PM Surya Ghar subsidy (up to ₹78,000 DBT)',
        ],
        roofCapacityKwp: Math.round(((Number(body.usableAreaSqft ?? 500) / 100) * 10)) / 10,
        assumptionSetId: 'in-ka-bescom-v2',
        assumptions: DEMO_ASSUMPTIONS,
        roofProfile: getDemoRoofProfiles()[0] ?? null,
        scenarios: [
          {
            id: `sc-${Date.now()}-1`,
            key: 'CONSERVATIVE',
            label: `Essential (${Math.max(1, Math.round(kwp * 0.6))} kWp)`,
            systemSizeKwp: Math.max(1, Math.round(kwp * 0.6)),
            annualGenerationKwh: Math.round(kwp * 0.6 * 1450),
            monthlyGenerationKwh: Math.round((kwp * 0.6 * 1450) / 12),
            estimatedCost: Math.round(kwp * 0.6 * 60000),
            subsidyAmount: Math.min(78000, Math.round(kwp * 0.6 * 30000)),
            netCost: Math.round(kwp * 0.6 * 60000) - Math.min(78000, Math.round(kwp * 0.6 * 30000)),
            annualSavings: Math.round(kwp * 0.6 * 1450 * tariff),
            monthlySavings: Math.round((kwp * 0.6 * 1450 * tariff) / 12),
            paybackYears: 3.5,
            lifetimeSavings25y: Math.round(kwp * 0.6 * 1450 * tariff * 22),
            co2OffsetTonnesPerYear: Math.round(kwp * 0.6 * 1.45 * 0.82 * 10) / 10,
            roofAreaRequiredSqft: Math.round(kwp * 0.6 * 100),
            offsetPercent: 65,
            notes: 'Lower capital investment, ideal for immediate peak daytime offset.',
          },
          {
            id: `sc-${Date.now()}-2`,
            key: 'OPTIMAL',
            label: `Recommended (${kwp} kWp)`,
            systemSizeKwp: kwp,
            annualGenerationKwh: Math.round(kwp * 1450),
            monthlyGenerationKwh: Math.round((kwp * 1450) / 12),
            estimatedCost: Math.round(kwp * 56000),
            subsidyAmount: 78000,
            netCost: Math.round(kwp * 56000) - 78000,
            annualSavings: Math.round(kwp * 1450 * tariff),
            monthlySavings: Math.round((kwp * 1450 * tariff) / 12),
            paybackYears: 4.2,
            lifetimeSavings25y: Math.round(kwp * 1450 * tariff * 22),
            co2OffsetTonnesPerYear: Math.round(kwp * 1.45 * 0.82 * 10) / 10,
            roofAreaRequiredSqft: Math.round(kwp * 100),
            offsetPercent: 100,
            notes: 'Covers 100% of household electricity draw plus surplus generation.',
          },
          {
            id: `sc-${Date.now()}-3`,
            key: 'MAX_ROOF',
            label: `Max Roof (${Math.round((kwp * 1.2) * 10) / 10} kWp)`,
            systemSizeKwp: Math.round((kwp * 1.2) * 10) / 10,
            annualGenerationKwh: Math.round(kwp * 1.2 * 1450),
            monthlyGenerationKwh: Math.round((kwp * 1.2 * 1450) / 12),
            estimatedCost: Math.round(kwp * 1.2 * 54000),
            subsidyAmount: 78000,
            netCost: Math.round(kwp * 1.2 * 54000) - 78000,
            annualSavings: Math.round(kwp * 1.2 * 1450 * tariff),
            monthlySavings: Math.round((kwp * 1.2 * 1450 * tariff) / 12),
            paybackYears: 4.4,
            lifetimeSavings25y: Math.round(kwp * 1.2 * 1450 * tariff * 22),
            co2OffsetTonnesPerYear: Math.round(kwp * 1.2 * 1.45 * 0.82 * 10) / 10,
            roofAreaRequiredSqft: Math.round(kwp * 1.2 * 100),
            offsetPercent: 115,
            notes: 'Maximizes energy export to the grid with BESCOM net-metering credits.',
          },
        ],
      };
      runs.unshift(newRun);
      saveDemoSizingRuns(runs);
      return newRun as unknown as T;
    }
  }
  if (cleanPath.startsWith('/sizing/runs/') || cleanPath.startsWith('sizing/runs/')) {
    const id = cleanPath.split('/')[3] ?? cleanPath.split('/')[2];
    const runs = getDemoSizingRuns();
    const run = runs.find((r) => r.id === id) ?? runs[0];
    return run as unknown as T;
  }
  if (cleanPath === '/sizing/estimate' || cleanPath === 'sizing/estimate') {
    const body = (options.body ?? {}) as { avgMonthlyUnits?: number; tariffPerKwh?: number; usableAreaSqft?: number };
    const units = Number(body.avgMonthlyUnits ?? 485);
    const tariff = Number(body.tariffPerKwh ?? 8.2);
    const kwp = Math.max(1, Math.round((units / 120) * 10) / 10);
    return {
      suitability: 'EXCELLENT',
      suitabilityReasons: [
        'Optimal solar irradiation in southern India (1,450 kWh/kWp/year)',
        'Qualifies for full PM Surya Ghar DBT subsidy (₹78,000 for ≥3 kWp)',
      ],
      roofCapacityKwp: Math.round(((Number(body.usableAreaSqft ?? 500) / 100) * 10)) / 10,
      loadBasedKwp: kwp,
      annualConsumptionKwh: units * 12,
      scenarios: [
        {
          key: 'OPTIMAL',
          label: `Recommended (${kwp} kWp)`,
          systemSizeKwp: kwp,
          annualGenerationKwh: Math.round(kwp * 1450),
          monthlyGenerationKwh: Math.round((kwp * 1450) / 12),
          estimatedCost: Math.round(kwp * 56000),
          subsidyAmount: 78000,
          netCost: Math.round(kwp * 56000) - 78000,
          annualSavings: Math.round(kwp * 1450 * tariff),
          monthlySavings: Math.round((kwp * 1450 * tariff) / 12),
          paybackYears: 4.2,
          lifetimeSavings25y: Math.round(kwp * 1450 * tariff * 22),
          co2OffsetTonnesPerYear: Math.round(kwp * 1.45 * 0.82 * 10) / 10,
          roofAreaRequiredSqft: Math.round(kwp * 100),
          offsetPercent: 100,
          notes: 'Covers 100% of household electricity consumption.',
        },
      ],
      assumptions: DEMO_ASSUMPTIONS,
      assumptionSetId: 'in-ka-bescom-v2',
      yieldEngine: 'PVGIS India Solar Engine v2.4',
    } as unknown as T;
  }

  // ── Quotes ────────────────────────────────────────────────────────
  if (cleanPath === '/quotes' || cleanPath === 'quotes') {
    if (method === 'GET') {
      return getDemoQuotes() as unknown as T;
    }
    if (method === 'POST') {
      const body = (options.body ?? {}) as Partial<Quote>;
      const quotes = getDemoQuotes();
      const newQuote: Quote = {
        id: `quote-${Date.now()}`,
        installerName: body.installerName ?? 'Authorized Solar Partner',
        systemSizeKwp: Number(body.systemSizeKwp ?? 5),
        totalPrice: Number(body.totalPrice ?? 275000),
        currency: 'INR',
        panelBrand: body.panelBrand ?? 'Tier 1 Mono PERC',
        panelTechnology: body.panelTechnology ?? 'MONO_PERC',
        panelWattage: 540,
        panelProductWarrantyYears: Number(body.panelProductWarrantyYears ?? 10),
        panelPerformanceWarrantyYears: 25,
        inverterBrand: body.inverterBrand ?? 'Growatt Inverter',
        inverterType: body.inverterType ?? 'STRING',
        inverterWarrantyYears: Number(body.inverterWarrantyYears ?? 10),
        workmanshipWarrantyYears: 5,
        includesNetMetering: true,
        includesStructure: true,
        includesAmcYears: 3,
        expectedAnnualGenerationKwh: Math.round(Number(body.systemSizeKwp ?? 5) * 1450),
        financingType: body.financingType ?? 'CASH',
        interestRatePct: null,
        tenureMonths: null,
        downPayment: null,
        pricePerKwp: Math.round(Number(body.totalPrice ?? 275000) / Number(body.systemSizeKwp ?? 5)),
        equipmentTier: 'STANDARD',
        valueScore: 81,
        scoreBreakdown: { price: 80, equipment: 80, warranty: 82, transparency: 85, weights: { price: 0.35, equipment: 0.25, warranty: 0.25, transparency: 0.15 } },
        redFlags: [],
        financedTotalCost: Number(body.totalPrice ?? 275000),
        estimatedAnnualSavings: Math.round(Number(body.systemSizeKwp ?? 5) * 1450 * 8.2),
        paybackYears: 4.4,
        generationSource: 'INSTALLER',
        monthlyPayment: null,
        isSelected: false,
        notes: body.notes ?? null,
        createdAt: new Date().toISOString(),
      };
      quotes.push(newQuote);
      saveDemoQuotes(quotes);
      return newQuote as unknown as T;
    }
  }
  if (cleanPath === '/quotes/comparison' || cleanPath === 'quotes/comparison') {
    return buildDemoComparison() as unknown as T;
  }
  if (cleanPath.startsWith('/quotes/') || cleanPath.startsWith('quotes/')) {
    const parts = cleanPath.split('/');
    const id = parts[2] ?? parts[1];
    if (parts.includes('select')) {
      const quotes = getDemoQuotes().map((q) => ({ ...q, isSelected: q.id === id }));
      saveDemoQuotes(quotes);
      return quotes.find((q) => q.id === id) as unknown as T;
    }
    const quotes = getDemoQuotes();
    return (quotes.find((q) => q.id === id) ?? quotes[0]) as unknown as T;
  }

  // ── Projects ──────────────────────────────────────────────────────
  if (cleanPath === '/projects' || cleanPath === 'projects') {
    return getDemoProjects() as unknown as T;
  }
  if (cleanPath.includes('/performance')) {
    return DEMO_PERFORMANCE as unknown as T;
  }
  if (cleanPath.includes('/warranties')) {
    return DEMO_WARRANTIES as unknown as T;
  }
  if (cleanPath.includes('/milestones/')) {
    const projects = getDemoProjects();
    const proj = projects[0];
    const mid = cleanPath.split('/milestones/')[1]?.split('/')[0];
    const body = (options.body ?? {}) as { status?: string };
    if (proj && mid) {
      const m = proj.milestones.find((item) => item.id === mid);
      if (m && body.status) {
        m.status = body.status as any;
        if (body.status === 'COMPLETED') m.completedDate = new Date().toISOString().slice(0, 10);
      }
      saveDemoProjects(projects);
      return proj as unknown as T;
    }
  }
  if (cleanPath.startsWith('/projects/') || cleanPath.startsWith('projects/')) {
    const projects = getDemoProjects();
    return projects[0] as unknown as T;
  }

  // ── Documents ─────────────────────────────────────────────────────
  if (cleanPath === '/documents' || cleanPath === 'documents') {
    if (method === 'GET') {
      return getDemoDocuments() as unknown as T;
    }
    if (method === 'POST') {
      const docs = getDemoDocuments();
      const newDoc: import('./types').DocumentRecord = {
        id: `doc-${Date.now()}`,
        fileName: 'Uploaded_Document.pdf',
        category: 'OTHER',
        sizeBytes: 524288,
        storageKey: `demo/uploads/uploaded-${Date.now()}.pdf`,
        mimeType: 'application/pdf',
        description: 'Uploaded prototype document',
        createdAt: new Date().toISOString(),
        projectId: null,
        quoteId: null,
        milestoneId: null,
      };
      docs.unshift(newDoc);
      saveDemoDocuments(docs);
      return newDoc as unknown as T;
    }
  }
  if (cleanPath.includes('/documents/constraints')) {
    return {
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxUploadMb: 25,
      storageDriver: 'LOCAL',
    } as unknown as T;
  }

  // ── Fallback ──────────────────────────────────────────────────────
  return {} as unknown as T;
}

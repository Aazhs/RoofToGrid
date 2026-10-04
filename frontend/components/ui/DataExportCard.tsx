'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { useAuth } from '@/lib/auth-context';

export function DataExportCard() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportJson = () => {
    setExporting(true);
    try {
      const demoData = typeof window !== 'undefined' ? localStorage.getItem('rtg.demoData') : null;
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        platform: 'RoofToGrid',
        compliance: 'India DPDPA 2023 & GDPR Right to Portability',
        user: {
          fullName: user?.fullName ?? 'Homeowner',
          email: user?.email ?? 'demo@rooftogrid.in',
        },
        records: demoData ? JSON.parse(demoData) : { status: 'standard_profile' },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rooftogrid-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify('Full JSON data archive downloaded', 'success');
    } catch {
      notify('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = () => {
    try {
      const csvRows = [
        ['Category', 'Item', 'Value', 'Unit / Details'],
        ['Profile', 'Account Name', user?.fullName ?? 'Demo User', ''],
        ['Profile', 'Contact', user?.email ?? 'demo@rooftogrid.in', ''],
        ['Sizing', 'Optimal System Size', '4.2', 'kWp'],
        ['Sizing', 'PM Surya Ghar Subsidy', '78000', 'INR'],
        ['Sizing', 'Est. Monthly Savings', '3850', 'INR/month'],
        ['Quotes', 'Vendor 1 (Tata Power Solar)', '58500', 'INR/kWp (Optimal)'],
        ['Quotes', 'Vendor 2 (Waaree Energies)', '54200', 'INR/kWp (Competitive)'],
        ['Quotes', 'Vendor 3 (Local EPC)', '49500', 'INR/kWp (Red Flag Flagged)'],
        ['Project', 'Current Stage', 'DISCOM Application Submitted', 'Stage 3 of 9'],
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const a = document.createElement('a');
      a.href = encodedUri;
      a.download = `rooftogrid-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      notify('CSV summary spreadsheet downloaded', 'success');
    } catch {
      notify('CSV export failed.', 'error');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Data Portability & Export (DPDPA 2023)"
        description="Under India's Digital Personal Data Protection Act, you own 100% of your data. Download your complete solar records anytime."
      />
      <CardBody className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Your export bundle includes all entered electricity bills, solar sizing projections, installer quotes with normalized scoring, project milestone timelines, and warranty registrations.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            loading={exporting}
            onClick={handleExportJson}
          >
            <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Complete JSON
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
          >
            <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV Spreadsheet
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

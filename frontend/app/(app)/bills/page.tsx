'use client';

/** Bill list + entry (US-A4, US-A5) with the 12-month stats used to pre-fill sizing (AC-A6). */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { DocumentUploader, DocumentList } from '@/components/domain/DocumentPanel';
import { api } from '@/lib/api';
import { currentMonth, formatCurrency, formatDate, formatMonth, formatNumber } from '@/lib/format';
import { useApi, useSubmit } from '@/lib/hooks';
import type { Bill, DocumentRecord } from '@/lib/types';

export default function BillsPage() {
  const { notify } = useToast();
  const bills = useApi(() => api.bills.list());
  const stats = useApi(() => api.bills.stats());
  const documents = useApi(() => api.documents.list({ category: 'BILL' }));
  const { pending, error, fieldErrors, run } = useSubmit();

  const [form, setForm] = useState({ billMonth: currentMonth(), unitsKwh: '', billAmount: '', tariffPerKwh: '' });

  const addBill = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = { billMonth: form.billMonth, unitsKwh: Number(form.unitsKwh) };
    if (form.billAmount) payload.billAmount = Number(form.billAmount);
    if (form.tariffPerKwh) payload.tariffPerKwh = Number(form.tariffPerKwh);

    const created = await run(() => api.bills.create(payload));
    if (created) {
      notify(`Saved ${formatMonth(created.billMonth)}`);
      setForm({ billMonth: currentMonth(), unitsKwh: '', billAmount: '', tariffPerKwh: '' });
      await Promise.all([bills.reload(), stats.reload()]);
    }
  };

  const removeBill = async (bill: Bill) => {
    await api.bills.remove(bill.id);
    notify(`Removed ${formatMonth(bill.billMonth)}`);
    await Promise.all([bills.reload(), stats.reload()]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Electricity bills</h1>
        <p className="mt-1 text-sm text-slate-600">
          The more months you add, the more reliable your sizing and savings numbers become.
        </p>
      </div>

      {stats.data && (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Months on file" value={formatNumber(stats.data.monthsCounted)} />
          <Stat label="Average units" value={`${formatNumber(stats.data.avgMonthlyUnits, 0)} kWh`} />
          <Stat label="Weighted tariff" value={`₹${stats.data.weightedTariffPerKwh}/unit`} />
          <Stat
            label="Average bill"
            value={stats.data.avgMonthlyBill ? formatCurrency(stats.data.avgMonthlyBill) : '—'}
            hint={stats.data.ready ? 'Ready for sizing' : 'Add 3+ months'}
            tone={stats.data.ready ? 'good' : 'warn'}
          />
        </dl>
      )}

      <Alert tone="info" title="Use the numbers printed on your bill">
        Bill scanning is not enabled yet. Enter the billing month, units consumed and amount below; the tariff
        is calculated by the API when you leave it blank.
      </Alert>

      <Card id="manual-bill-form">
        <CardHeader title="Manual entry" description="Units plus either the amount or the tariff." />
        <CardBody>
          {error && (
            <Alert tone="error" className="mb-3">
              {error}
            </Alert>
          )}
          <form className="grid gap-4 sm:grid-cols-4" onSubmit={addBill} noValidate>
            <TextField
              id="billMonth"
              label="Month"
              type="month"
              required
              value={form.billMonth}
              error={fieldErrors.billMonth}
              onChange={(e) => setForm({ ...form, billMonth: e.target.value })}
            />
            <TextField
              id="unitsKwh"
              label="Units (kWh)"
              type="number"
              min={1}
              required
              value={form.unitsKwh}
              error={fieldErrors.unitsKwh}
              onChange={(e) => setForm({ ...form, unitsKwh: e.target.value })}
            />
            <TextField
              id="billAmount"
              label="Amount (₹)"
              type="number"
              min={1}
              value={form.billAmount}
              error={fieldErrors.billAmount}
              onChange={(e) => setForm({ ...form, billAmount: e.target.value })}
            />
            <TextField
              id="tariffPerKwh"
              label="Tariff (₹/unit)"
              type="number"
              min={0.5}
              step={0.1}
              value={form.tariffPerKwh}
              error={fieldErrors.tariffPerKwh}
              onChange={(e) => setForm({ ...form, tariffPerKwh: e.target.value })}
            />
            <div className="sm:col-span-4">
              <Button type="submit" loading={pending}>
                Save month
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="History" description="Re-adding the same month updates it." />
        <CardBody>
          {bills.loading ? (
            <Spinner />
          ) : bills.data && bills.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-sm">
                <caption className="sr-only">Electricity bill history</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th scope="col" className="py-2 pr-3 font-medium">Month</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Units</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Amount</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Tariff</th>
                    <th scope="col" className="py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bills.data.map((bill) => (
                    <tr key={bill.id} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-800">
                        {formatMonth(bill.billMonth)}
                      </th>
                      <td className="py-2 pr-3">{formatNumber(bill.unitsKwh)}</td>
                      <td className="py-2 pr-3">{bill.billAmount ? formatCurrency(bill.billAmount) : '—'}</td>
                      <td className="py-2 pr-3">₹{bill.tariffPerKwh}/unit</td>
                      <td className="py-2 text-right">
                        <Button size="sm" variant="danger" onClick={() => void removeBill(bill)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No bills yet"
              description="Add your most recent month to get started. Older months improve the average."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bill copies" description="Optional, stored privately in your vault." level={3} />
        <CardBody className="space-y-4">
          <DocumentUploader
            defaultCategory="BILL"
            onUploaded={(doc: DocumentRecord) => {
              notify(`Uploaded ${doc.fileName}`);
              void documents.reload();
            }}
          />
          <DocumentList
            documents={documents.data ?? []}
            emptyMessage="No bill copies uploaded."
            onDeleted={() => void documents.reload()}
          />
          {documents.data && documents.data.length > 0 && (
            <p className="text-xs text-slate-500">
              Last upload {formatDate(documents.data[0]?.createdAt)}.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

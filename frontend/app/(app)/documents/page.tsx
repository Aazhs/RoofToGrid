'use client';

/** Document vault (US-E1 … US-E4): upload, filter, open, delete. */
import { useState } from 'react';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { SelectField } from '@/components/ui/Field';
import { Alert, Spinner, useToast } from '@/components/ui/Feedback';
import { DocumentUploader, DocumentList } from '@/components/domain/DocumentPanel';
import { DOCUMENT_CATEGORIES } from '@/lib/constants';
import { formatFileSize, formatNumber } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import type { DocumentCategory } from '@/lib/types';

export default function DocumentsPage() {
  const { notify } = useToast();
  const [category, setCategory] = useState<'' | DocumentCategory>('');
  const documents = useApi(() => api.documents.list(category ? { category } : undefined), [category]);
  const all = useApi(() => api.documents.list());

  const totalBytes = (all.data ?? []).reduce((sum, doc) => sum + doc.sizeBytes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Document vault</h1>
        <p className="mt-1 text-sm text-slate-600">
          Bills, quotes, contracts, approvals and warranties in one private place. Files are never public —
          every download is checked against your account.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Documents" value={formatNumber(all.data?.length ?? 0)} />
        <Stat label="Storage used" value={formatFileSize(totalBytes)} />
        <Stat label="Upload limit" value="10 MB per file" hint="PDF, JPEG, PNG, WebP" />
      </dl>

      <Card>
        <CardHeader title="Upload" />
        <CardBody>
          <DocumentUploader
            onUploaded={(doc) => {
              notify(`Uploaded ${doc.fileName}`);
              void documents.reload();
              void all.reload();
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Your files"
          actions={
            <SelectField
              id="filter"
              label="Filter"
              className="min-w-[12rem]"
              options={[{ value: '', label: 'All categories' }, ...DOCUMENT_CATEGORIES]}
              value={category}
              onChange={(e) => setCategory(e.target.value as '' | DocumentCategory)}
            />
          }
        />
        <CardBody>
          {documents.error && <Alert tone="error">{documents.error}</Alert>}
          {documents.loading ? (
            <Spinner />
          ) : (
            <DocumentList
              documents={documents.data ?? []}
              emptyMessage={
                category ? 'Nothing in this category yet.' : 'No documents yet. Upload your first bill or quote.'
              }
              onDeleted={() => {
                void documents.reload();
                void all.reload();
              }}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

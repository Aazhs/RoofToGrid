'use client';

/**
 * Upload + list for the document vault (US-E1 … US-E3).
 * Downloads go through an authenticated fetch, never a public URL (AC-E4).
 */
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { ApiError, api, downloadDocument } from '@/lib/api';
import { DOCUMENT_CATEGORIES } from '@/lib/constants';
import { formatDate, formatFileSize, titleCase } from '@/lib/format';
import type { DocumentCategory, DocumentRecord } from '@/lib/types';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export function DocumentUploader({
  defaultCategory = 'OTHER',
  projectId,
  milestoneId,
  quoteId,
  onUploaded,
  compact = false,
}: {
  defaultCategory?: DocumentCategory;
  projectId?: string;
  milestoneId?: string;
  quoteId?: string;
  onUploaded: (doc: DocumentRecord) => void;
  compact?: boolean;
}) {
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const doc = await api.documents.upload(file, {
        category,
        projectId,
        milestoneId,
        quoteId,
        description: description || undefined,
      });
      onUploaded(doc);
      setFile(null);
      setDescription('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}

      <div className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'}>
        <div>
          <label className="label" htmlFor="document-file">
            File
          </label>
          <input
            id="document-file"
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-brand-800"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            aria-describedby="document-file-hint"
          />
          <p className="hint" id="document-file-hint">
            PDF, JPEG, PNG or WebP, up to 10 MB. Stored privately — only you can open it.
          </p>
        </div>

        <SelectField
          id="document-category"
          label="What is it?"
          options={DOCUMENT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
        />

        <TextField
          id="document-description"
          label="Description (optional)"
          wrapperClassName={compact ? '' : 'sm:col-span-2'}
          value={description}
          placeholder="April bill, signed contract, DISCOM approval letter…"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" loading={pending} disabled={!file}>
        Upload
      </Button>
    </form>
  );
}

export function DocumentList({
  documents,
  onDeleted,
  emptyMessage = 'No documents yet.',
}: {
  documents: DocumentRecord[];
  onDeleted?: (id: string) => void;
  emptyMessage?: string;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (documents.length === 0) {
    return <p className="px-1 py-4 text-sm text-slate-600">{emptyMessage}</p>;
  }

  const handleDownload = async (doc: DocumentRecord) => {
    setBusyId(doc.id);
    setError(null);
    try {
      await downloadDocument(doc.id, doc.fileName);
    } catch {
      setError('Could not open that file. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    if (!onDeleted) return;
    setBusyId(doc.id);
    setError(null);
    try {
      await api.documents.remove(doc.id);
      onDeleted(doc.id);
    } catch {
      setError('Could not delete that file. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {error && (
        <Alert tone="error" className="mb-3">
          {error}
        </Alert>
      )}
      <ul className="divide-y divide-slate-200">
        {documents.map((doc) => (
          <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-[12rem] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                <Badge tone="muted">{titleCase(doc.category)}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatFileSize(doc.sizeBytes)} · uploaded {formatDate(doc.createdAt)}
                {doc.project ? ` · ${doc.project.name}` : ''}
                {doc.milestone ? ` · ${doc.milestone.title}` : ''}
              </p>
              {doc.description && <p className="mt-0.5 text-xs text-slate-600">{doc.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" loading={busyId === doc.id} onClick={() => void handleDownload(doc)}>
                Open
              </Button>
              {onDeleted && (
                <Button size="sm" variant="danger" onClick={() => void handleDelete(doc)}>
                  Delete
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Labelled form controls. Every control gets an id, a <label htmlFor>, and aria-describedby wiring for
 * hints and errors (NFR-U5).
 */
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface WrapperProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ id, label, hint, error, required, children, className = '' }: WrapperProps) {
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100';
const CONTROL_ERROR = 'border-red-400';

function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export function TextField({ id, label, hint, error, wrapperClassName, className = '', ...rest }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={rest.required} className={wrapperClassName}>
      <input
        id={id}
        name={rest.name ?? id}
        className={`${CONTROL} ${error ? CONTROL_ERROR : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  options: Array<{ value: string; label: string }>;
  wrapperClassName?: string;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  options,
  wrapperClassName,
  className = '',
  ...rest
}: SelectFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={rest.required} className={wrapperClassName}>
      <select
        id={id}
        name={rest.name ?? id}
        className={`${CONTROL} ${error ? CONTROL_ERROR : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className = '',
  ...rest
}: TextAreaFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={rest.required} className={wrapperClassName}>
      <textarea
        id={id}
        name={rest.name ?? id}
        rows={rest.rows ?? 3}
        className={`${CONTROL} ${error ? CONTROL_ERROR : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

export function CheckboxField({ id, label, hint, className = '', ...rest }: CheckboxFieldProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <input
        id={id}
        name={rest.name ?? id}
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...rest}
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && (
          <p className="hint" id={`${id}-hint`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

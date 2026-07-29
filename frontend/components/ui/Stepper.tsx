/** Wizard progress indicator (onboarding, NFR-U3). */
export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <nav aria-label="Onboarding steps">
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const state = index === current ? 'current' : index < current ? 'done' : 'upcoming';
          const base =
            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium sm:text-sm';
          const tone =
            state === 'current'
              ? 'border-brand-300 bg-brand-50 text-brand-800'
              : state === 'done'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-500';

          const content = (
            <>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  state === 'done' ? 'bg-emerald-600 text-white' : state === 'current' ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
                aria-hidden="true"
              >
                {state === 'done' ? '✓' : index + 1}
              </span>
              {step}
            </>
          );

          return (
            <li key={step}>
              {onSelect && index <= current ? (
                <button type="button" className={`${base} ${tone}`} onClick={() => onSelect(index)}>
                  {content}
                  <span className="sr-only">{state === 'done' ? '(completed)' : '(current step)'}</span>
                </button>
              ) : (
                <span className={`${base} ${tone}`} aria-current={state === 'current' ? 'step' : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

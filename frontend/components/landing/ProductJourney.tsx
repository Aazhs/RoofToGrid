import Link from 'next/link';

const STAGES = [
  {
    number: '01',
    title: 'Plan the right size',
    input: 'Your bill + usable roof area',
    output: 'A conservative size, net cost, subsidy and payback range',
    protects: 'Oversizing and sales-led assumptions',
  },
  {
    number: '02',
    title: 'Audit every quote',
    input: 'Price, equipment, warranty and written scope',
    output: 'Normalized ₹/kWp, transparent score and specific questions',
    protects: 'Choosing the cheapest incomplete proposal',
  },
  {
    number: '03',
    title: 'Control the installation',
    input: 'Dates, owners, approvals and documents',
    output: 'A nine-stage project record with one clear next action',
    protects: 'Losing decisions inside calls and WhatsApp threads',
  },
  {
    number: '04',
    title: 'Verify the promise',
    input: 'Monthly inverter generation reading',
    output: 'Actual vs seasonal projection and an underperformance action',
    protects: 'Silent production loss after commissioning',
  },
] as const;

export function ProductJourney() {
  return (
    <>
      <section id="how-it-works" className="mx-auto max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">One homeowner workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface md:text-5xl">Four decisions. One record.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-on-surface-variant md:pt-8">
            The value is not another solar dashboard. It is carrying the same household assumptions from sizing to quote selection, installation and performance—so claims can be checked later.
          </p>
        </div>

        <div className="mt-12 divide-y divide-outline-variant border-y border-outline-variant">
          {STAGES.map((stage) => (
            <article key={stage.number} className="grid gap-4 py-7 md:grid-cols-[70px_0.75fr_1.25fr] md:items-start md:py-9">
              <span className="font-mono text-sm text-brand-600">{stage.number}</span>
              <div><h3 className="text-xl font-semibold text-on-surface">{stage.title}</h3><p className="mt-2 text-sm text-on-surface-variant">Input: {stage.input}</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-container-low p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">You leave with</p><p className="mt-2 text-sm font-medium leading-6 text-on-surface">{stage.output}</p></div>
                <div className="rounded-xl border border-outline-variant p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Protects against</p><p className="mt-2 text-sm leading-6 text-on-surface">{stage.protects}</p></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-end"><Link href="/demo" className="rounded-xl bg-on-surface px-6 py-3 text-sm font-semibold text-surface">Walk through all four stages →</Link></div>
      </section>

      <section id="principles" className="bg-[#16251e] py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-4 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9cbb9]">Trust is a product feature</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">No fake precision.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/65">Today&apos;s product is manual where external integrations do not exist. That is more useful than pretending a progress bar is AI.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Calculations', 'Every estimate names its assumption set and shows what can change the result.'],
              ['Installer neutrality', 'We score quotes you enter. We do not sell placement or claim to verify vendors.'],
              ['Automation', 'Bill OCR, quote parsing, DISCOM status and inverter sync stay labelled as planned until connected.'],
              ['Your data', 'The public demo runs in your browser. Account documents use authenticated private storage.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{body}</p></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

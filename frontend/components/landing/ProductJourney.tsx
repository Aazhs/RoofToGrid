import Link from 'next/link';

const STAGES = [
  {
    number: '01',
    icon: 'panel',
    color: '#e2f3e9',
    title: 'Plan the right system size',
    input: 'Your electricity bill and usable roof area',
    output: 'System size, net cost, subsidy and payback range',
    protects: 'Being sold more panels than your home needs',
  },
  {
    number: '02',
    icon: 'quote',
    color: '#fff0d5',
    title: 'Audit every installer quote',
    input: 'Price, panel, inverter, warranty and written scope',
    output: 'Normalized ₹/kWp, value score and questions to ask',
    protects: 'Choosing a cheap quote with expensive exclusions',
  },
  {
    number: '03',
    icon: 'milestone',
    color: '#e4effc',
    title: 'Control the installation',
    input: 'Dates, owners, approvals and project documents',
    output: 'Nine accountable stages with one clear next action',
    protects: 'Losing approvals inside calls and message threads',
  },
  {
    number: '04',
    icon: 'chart',
    color: '#eee8fb',
    title: 'Verify the solar output',
    input: 'Monthly generation from your inverter reading',
    output: 'Actual vs seasonal projection and a health verdict',
    protects: 'Silent underperformance after commissioning',
  },
] as const;

export function ProductJourney() {
  return (
    <>
      <section id="how-it-works" className="relative overflow-hidden border-y border-[#dce5df] bg-gradient-to-br from-[#edf7f1] via-[#f8fbff] to-[#fff5e4] py-20 md:py-28">
        <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[#80b99a]/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-7rem] left-[-6rem] h-80 w-80 rounded-full bg-[#73a7dc]/15 blur-[100px]" />
        <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d3b08]">From first bill to live panels</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17201b] md:text-5xl">Four solar decisions. One connected record.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#536059]">
              Your sizing assumptions follow the project into quote selection, installation and performance—so every promise can be checked later.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {STAGES.map((stage) => (
              <article key={stage.number} className="group rounded-3xl border border-white/90 bg-white/75 p-5 shadow-[0_16px_45px_rgba(41,69,54,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(41,69,54,0.13)] md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: stage.color }}>
                    <StageIcon name={stage.icon} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#78827c]">Stage {stage.number}</p>
                    <h3 className="mt-1 text-xl font-bold text-[#17201b]">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f6963]">Start with {stage.input.toLowerCase()}.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f2f6f3] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#68736d]">You leave with</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#223029]">{stage.output}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5df] bg-white/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#68736d]">Protects against</p>
                    <p className="mt-2 text-sm leading-6 text-[#34423a]">{stage.protects}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-9 flex justify-center">
            <Link href="/demo" className="rounded-xl bg-[#17201b] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2b3831]">Walk through all four stages →</Link>
          </div>
        </div>
      </section>

      <section id="principles" className="relative overflow-hidden bg-[#16251e] py-20 text-white md:py-28">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#e7a42c]/15 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-[#5aae80]/15 blur-[110px]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 px-4 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9cbb9]">Trust is a product feature</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">Useful numbers, without fake precision.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#c6d5cc]">Today&apos;s product stays manual wherever an external integration does not exist. Your decision should never depend on a decorative AI loading bar.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Calculations', 'Every estimate names its assumption set and shows what can change the result.'],
              ['Installer neutrality', 'We score quotes you enter. We do not sell placement or claim to verify vendors.'],
              ['Automation', 'Bill OCR, quote parsing, DISCOM status and inverter sync stay planned until connected.'],
              ['Your data', 'The public demo runs in your browser. Account documents use authenticated private storage.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-[#ffffff24] bg-[#ffffff0b] p-5 backdrop-blur-sm"><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#bccdc3]">{body}</p></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StageIcon({ name }: { name: (typeof STAGES)[number]['icon'] }) {
  const common = 'h-8 w-8 text-[#1c5f3e]';
  if (name === 'panel') {
    return <svg viewBox="0 0 32 32" fill="none" className={common} aria-hidden="true"><circle cx="24" cy="7" r="4" fill="#e7a42c" /><path d="M5 12h19l3 11H2l3-11Z" stroke="currentColor" strokeWidth="2" /><path d="M8 12 6 23m7-11-1 11m6-11 1 11m-15-5h22M14 23v5m4-5v5m-7 0h10" stroke="currentColor" strokeWidth="1.5" /></svg>;
  }
  if (name === 'quote') {
    return <svg viewBox="0 0 32 32" fill="none" className={common} aria-hidden="true"><rect x="5" y="3" width="22" height="26" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M10 10h12M10 15h12M10 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="m20 23 2 2 4-5" stroke="#bd4809" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (name === 'milestone') {
    return <svg viewBox="0 0 32 32" fill="none" className={common} aria-hidden="true"><path d="M9 6h14M9 16h14M9 26h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="6" cy="6" r="3" fill="#4c9b73" /><circle cx="6" cy="16" r="3" fill="#e7a42c" /><circle cx="6" cy="26" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
  }
  return <svg viewBox="0 0 32 32" fill="none" className={common} aria-hidden="true"><path d="M4 27V5M4 27h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="m7 23 6-7 5 3 8-11" stroke="#bd4809" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="26" cy="8" r="3" fill="#e7a42c" /></svg>;
}

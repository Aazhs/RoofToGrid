<section id="features" class="features-section">
  <div class="container">
    <div class="section-head">
      <span class="badge-pill">⚡ Core Engineering Principles</span>
      <h2 class="title">Built Specifically for the Indian Solar Consumer</h2>
      <p class="subtitle">
        Unlike vendor aggregators who sell your phone number to telecallers, RoofToGrid is 100% open-source,
        independent, and designed to protect your investment.
      </p>
    </div>

    <div class="cards-grid">
      <div class="card feature-card">
        <div class="icon-wrap bg-amber">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h3 class="card-title">PM Surya Ghar Subsidy DBT</h3>
        <p class="card-desc">
          Official central subsidy calculation: ₹30,000 for 1 kWp, ₹60,000 for 2 kWp, and ₹78,000 for 3 kWp+ systems
          transferred directly to your bank account.
        </p>
      </div>

      <div class="card feature-card">
        <div class="icon-wrap bg-blue">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h3 class="card-title">Apartment Balcony Solar</h3>
        <p class="card-desc">
          AI spatial vision calibrated against apartment railings and door heights. Sizing for 400W–1200W plug-and-play
          microinverter kits plugged into a 16A wall socket.
        </p>
      </div>

      <div class="card feature-card">
        <div class="icon-wrap bg-emerald">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <h3 class="card-title">EPC Quote Auditor</h3>
        <p class="card-desc">
          Upload any PDF or quote. Our engine evaluates equipment tiers (TopCon vs Mono PERC), warranty terms,
          and flags red flags like undersized inverters or hidden liaison fees.
        </p>
      </div>

      <div class="card feature-card">
        <div class="icon-wrap bg-purple">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h3 class="card-title">&lt;400 µs Go Engine Latency</h3>
        <p class="card-desc">
          Zero Node/Python latency. Solar sizing algorithms compile down to a native static Go binary, delivering
          instantaneous simulation without heavy server overhead.
        </p>
      </div>

      <div class="card feature-card">
        <div class="icon-wrap bg-indigo">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h3 class="card-title">Privacy & DPDPA Compliant</h3>
        <p class="card-desc">
          Your data is strictly yours. We do not sell leads to sales callers. 1-click export of your bills,
          sizing scenarios, and quotes in standardized JSON/CSV formats.
        </p>
      </div>

      <div class="card feature-card">
        <div class="icon-wrap bg-teal">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <h3 class="card-title">Multi-Lingual (4 Indian Languages)</h3>
        <p class="card-desc">
          Seamlessly toggle between English, Hindi, Gujarati, and Marathi to evaluate solar options in your native language
          with authentic regional DISCOM terminology.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .features-section {
    padding: 4.5rem 0;
  }

  .section-head {
    text-align: center;
    max-width: 760px;
    margin: 0 auto 3rem;
  }

  .badge-pill {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(15, 23, 42, 0.08);
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  :global(.dark) .badge-pill {
    background: rgba(248, 250, 252, 0.12);
    color: #f8fafc;
  }

  @media (prefers-color-scheme: dark) {
    .badge-pill {
      background: rgba(248, 250, 252, 0.12);
      color: #f8fafc;
    }
  }

  .title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-main);
    margin-bottom: 0.75rem;
  }

  .subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 640px) {
    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.75rem;
    border-radius: 1rem;
    background: var(--bg-surface-card);
    border: 1px solid var(--border-outline);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
  }

  .bg-amber {
    background: rgba(245, 158, 11, 0.12);
    color: #d97706;
  }

  .bg-blue {
    background: rgba(2, 132, 199, 0.12);
    color: #0284c7;
  }

  .bg-emerald {
    background: rgba(5, 150, 105, 0.12);
    color: #059669;
  }

  .bg-purple {
    background: rgba(147, 51, 234, 0.12);
    color: #9333ea;
  }

  .bg-indigo {
    background: rgba(79, 70, 229, 0.12);
    color: #4f46e5;
  }

  .bg-teal {
    background: rgba(13, 148, 136, 0.12);
    color: #0d9488;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .card-desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.6;
  }
</style>

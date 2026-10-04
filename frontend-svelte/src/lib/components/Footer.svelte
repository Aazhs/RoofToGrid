<footer class="footer">
  <div class="container footer-container">
    <div class="footer-top">
      <div class="footer-brand-col">
        <div class="brand">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" stroke="#f59e0b" fill="#fef3c7" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#d97706" />
          </svg>
          <span class="brand-name">RoofToGrid</span>
        </div>
        <p class="brand-desc">
          Independent, vendor-neutral solar engineering platform for Indian homeowners and apartment residents.
          100% free, privacy-first, and open-source.
        </p>
        <div class="stack-badge">
          <span>⚡ SvelteKit 5 · Go Binary (&lt;400µs) · Supabase</span>
        </div>
      </div>

      <div class="footer-links-col">
        <h4 class="col-title">Solar Tools</h4>
        <a href="#calculator" class="f-link">Instant Rooftop Sizer</a>
        <a href="#balcony" class="f-link">Apartment Balcony AI</a>
        <a href="#installers" class="f-link">EPC Quote Intelligence</a>
        <a href="#subsidy" class="f-link">PM Surya Ghar Calculator</a>
      </div>

      <div class="footer-links-col">
        <h4 class="col-title">Government & DISCOM</h4>
        <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer" class="f-link">
          National Portal (pmsuryaghar.gov.in)
        </a>
        <a href="https://mnre.gov.in" target="_blank" rel="noopener noreferrer" class="f-link">
          MNRE Guidelines
        </a>
        <span class="f-link">BESCOM / MSEDCL / UGVCL</span>
        <span class="f-link">BSES / TANGEDCO / UPPCL</span>
      </div>

      <div class="footer-links-col">
        <h4 class="col-title">Open Source & Trust</h4>
        <a href="https://github.com/Aazhs/RoofToGrid" target="_blank" rel="noopener noreferrer" class="f-link">
          GitHub Repository (Public)
        </a>
        <span class="f-link">India DPDPA Compliant</span>
        <span class="f-link">Zero Ad Trackers</span>
        <span class="f-link">MIT License</span>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">
        © 2026 RoofToGrid. Empowering India's 1 Crore Solar Rooftop Mission under PM Surya Ghar Muft Bijli Yojana.
      </p>
      <div class="bottom-links">
        <a href="https://github.com/Aazhs/RoofToGrid" target="_blank" rel="noopener noreferrer" class="b-link">
          GitHub
        </a>
        <a href="#calculator" class="b-link">Privacy</a>
        <a href="#calculator" class="b-link">Terms</a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--bg-surface-elevated);
    border-top: 1px solid var(--border-outline);
    padding: 4rem 0 2rem;
  }

  .footer-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .footer-top {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  @media (min-width: 768px) {
    .footer-top {
      grid-template-columns: 2fr 1fr 1fr 1fr;
    }
  }

  .footer-brand-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brand-name {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
  }

  .brand-desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 320px;
  }

  .stack-badge {
    display: inline-block;
    padding: 0.35rem 0.65rem;
    border-radius: 0.5rem;
    background: var(--bg-surface-card);
    border: 1px solid var(--border-outline);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-subtle);
    width: fit-content;
  }

  .footer-links-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .col-title {
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .f-link {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  a.f-link:hover {
    color: var(--text-main);
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-outline);
    font-size: 0.8125rem;
    color: var(--text-subtle);
  }

  @media (min-width: 640px) {
    .footer-bottom {
      flex-direction: row;
    }
  }

  .bottom-links {
    display: flex;
    gap: 1.25rem;
  }

  .b-link {
    color: var(--text-subtle);
    text-decoration: none;
  }

  .b-link:hover {
    color: var(--text-main);
  }
</style>

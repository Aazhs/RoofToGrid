import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RoofToGrid — India\'s Smartest Rooftop Solar Planning Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#090e17',
          backgroundImage:
            'radial-gradient(circle at 90% 15%, rgba(245, 158, 11, 0.22) 0%, transparent 55%), radial-gradient(circle at 10% 85%, rgba(16, 185, 129, 0.15) 0%, transparent 45%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Top Logo Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 900,
                color: '#090e17',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
              }}
            >
              ☀
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Roof<span style={{ color: '#f59e0b' }}>To</span>Grid
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            🇮🇳 PM Surya Ghar Ready · ₹78,000 Subsidy
          </div>
        </div>

        {/* Main Hero Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #ffffff 30%, #cbd5e1 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            India&apos;s Smartest Rooftop Solar Planning Platform
          </div>
          <div style={{ fontSize: '24px', color: '#94a3b8', lineHeight: 1.4 }}>
            Accurate kWp sizing, unbiased installer quote comparison, and turnkey subsidy tracking for residential rooftops.
          </div>
        </div>

        {/* 3 Pillar Cards */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              ⚡ Instant Sizing
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
              No-Signup Calculator
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Estimate system capacity, monthly yield & 25-yr financial payback
            </div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
              ⚖️ Fair Comparison
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
              Quote Normalizer
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Compare ₹/kWp, equipment tier, warranties & financing side-by-side
            </div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              🏛️ DISCOM & Subsidy
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
              Milestone Tracker
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              From net-meter application to ₹78,000 DBT credit in your bank
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#64748b' }}>
          <div>rooftogrid.in · Free Solar Planning for Homeowners</div>
          <div>Compatible with 60+ Indian DISCOMs (BESCOM, TANGEDCO, MSEDCL, Tata Power)</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

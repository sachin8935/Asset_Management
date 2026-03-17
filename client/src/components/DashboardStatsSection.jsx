import { useEffect, useState } from 'react'

import { fetchDashboardStats } from '../services/dashboardService'

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .dss-root * { box-sizing: border-box; }
    .dss-root { font-family: 'DM Sans', sans-serif; }
    .dss-display { font-family: 'Syne', sans-serif; }

    .dss-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
      gap: 16px;
    }

    .dss-stat-card {
      border-radius: 18px;
      padding: 20px 22px;
      position: relative; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.04);
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: default;
    }
    .dss-stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.09);
    }

    .dss-stat-icon-wrap {
      width: 38px; height: 38px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
    }
    .dss-stat-label {
      font-size: 10.5px; font-weight: 700;
      letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 6px;
    }
    .dss-stat-value {
      font-family: 'Syne', sans-serif;
      font-size: 38px; font-weight: 800;
      line-height: 1; letter-spacing: -0.04em;
    }
    .dss-stat-sub {
      font-size: 11.5px; margin-top: 6px;
      opacity: 0.65; font-weight: 300;
    }

    .dss-error-bar {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 12px 16px; border-radius: 12px; font-size: 13px;
      background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c;
    }

    @keyframes dss-spin { to { transform: rotate(360deg); } }
    .dss-spinner {
      display: inline-block; width: 18px; height: 18px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: dss-spin 0.7s linear infinite; flex-shrink: 0;
    }

    @keyframes dss-fade-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dss-stat-card:nth-child(1) { animation: dss-fade-up 0.3s 0.04s ease both; }
    .dss-stat-card:nth-child(2) { animation: dss-fade-up 0.3s 0.09s ease both; }
    .dss-stat-card:nth-child(3) { animation: dss-fade-up 0.3s 0.14s ease both; }
    .dss-stat-card:nth-child(4) { animation: dss-fade-up 0.3s 0.19s ease both; }
    .dss-stat-card:nth-child(5) { animation: dss-fade-up 0.3s 0.24s ease both; }
  `}</style>
)

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Ico = ({ d, size = 18, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const P = {
  total:       'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  assigned:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  available:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  maintenance: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  issues:      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01',
  warning:     'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  refresh:     'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
}

// ─── Per-stat visual config ───────────────────────────────────────────────────
const STAT_CONFIGS = [
  {
    key:       'total_assets',
    label:     'Total assets',
    sub:       'Across all categories',
    icon:      P.total,
    gradient:  'linear-gradient(135deg,#1a1612 0%,#3d2e26 100%)',
    valColor:  '#ffffff',
    subColor:  '#a09488',
    iconBg:    'rgba(255,255,255,0.12)',
    iconColor: '#ff8a5c',
  },
  {
    key:       'assigned_assets',
    label:     'Assigned',
    sub:       'Currently in use',
    icon:      P.assigned,
    gradient:  'linear-gradient(135deg,#fffbf0 0%,#fef3c7 100%)',
    valColor:  '#78450a',
    subColor:  '#b88a3a',
    iconBg:    'rgba(245,158,11,0.15)',
    iconColor: '#d97706',
  },
  {
    key:       'available_assets',
    label:     'Available',
    sub:       'Ready to assign',
    icon:      P.available,
    gradient:  'linear-gradient(135deg,#f0fdf4 0%,#bbf7d0 100%)',
    valColor:  '#065f46',
    subColor:  '#16a075',
    iconBg:    'rgba(16,185,129,0.15)',
    iconColor: '#059669',
  },
  {
    key:       'assets_under_maintenance',
    label:     'Maintenance',
    sub:       'Under service',
    icon:      P.maintenance,
    gradient:  'linear-gradient(135deg,#fff8f5 0%,#ffe8dc 100%)',
    valColor:  '#c84b10',
    subColor:  '#e06030',
    iconBg:    'rgba(255,107,53,0.15)',
    iconColor: '#ff6b35',
  },
  {
    key:       'open_issues',
    label:     'Open issues',
    sub:       'Awaiting resolution',
    icon:      P.issues,
    gradient:  'linear-gradient(135deg,#fff5f5 0%,#fecaca 100%)',
    valColor:  '#7f1d1d',
    subColor:  '#dc2626',
    iconBg:    'rgba(220,38,38,0.15)',
    iconColor: '#ef4444',
  },
]

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ config, value }) {
  const { label, sub, icon, gradient, valColor, subColor, iconBg, iconColor } = config
  return (
    <div className="dss-stat-card" style={{ background: gradient }}>
      <div className="dss-stat-icon-wrap" style={{ background: iconBg }}>
        <Ico d={icon} size={18} color={iconColor} sw={2} />
      </div>
      <p className="dss-stat-label" style={{ color: subColor }}>{label}</p>
      <p className="dss-stat-value" style={{ color: valColor }}>{value ?? '—'}</p>
      <p className="dss-stat-sub"   style={{ color: subColor }}>{sub}</p>
    </div>
  )
}

// ─── Main (same logic as original) ───────────────────────────────────────────
export default function DashboardStatsSection({ token }) {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let isMounted = true
    const loadStats = async () => {
      setLoading(true); setError('')
      try {
        const data = await fetchDashboardStats(token)
        if (isMounted) setStats(data.stats)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadStats()
    return () => { isMounted = false }
  }, [token])

  return (
    <>
      <SectionStyles />
      <div className="dss-root">

        {/* ── Heading ── */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
            }}>
              <Ico d={P.total} size={18} color="white" sw={2} />
            </div>
            <div>
              <h2 className="dss-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Dashboard
              </h2>
              <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
                Live snapshot of your asset ecosystem
              </p>
            </div>
          </div>

          {!loading && stats && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c2bcb3' }}>
              <Ico d={P.refresh} size={13} color="#c2bcb3" />
              Updated just now
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '48px 0', color: '#9a928a', fontSize: 13 }}>
            <span className="dss-spinner" />
            Loading dashboard…
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="dss-error-bar">
            <Ico d={P.warning} size={14} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Stats grid ── */}
        {!loading && !error && stats && (
          <div className="dss-grid">
            {STAT_CONFIGS.map(config => (
              <StatCard key={config.key} config={config} value={stats[config.key]} />
            ))}
          </div>
        )}

      </div>
    </>
  )
}
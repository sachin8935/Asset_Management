import { useState, useEffect, useRef } from 'react'

const HEALTH_CHECK_TIMEOUT_MS = 8000
const HEALTH_CHECK_INTERVAL_MS = 3000
const HEALTH_CHECK_MAX_WAIT_MS = 60000
const FALLBACK_PROD_API_BASE_URL = 'https://asset-management-utgk.onrender.com'

function resolveApiBaseUrl() {
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
  if (envBaseUrl) return envBaseUrl

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
    return FALLBACK_PROD_API_BASE_URL
  }

  return ''
}

function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  const apiBaseUrl = resolveApiBaseUrl()
  if (!apiBaseUrl) return path
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

async function pingHealth(timeoutMs = HEALTH_CHECK_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(buildApiUrl('/api/health'), {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })

    return response.ok
  } catch (_error) {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: 'Asset Lifecycle',
    desc: 'Track every asset from procurement to retirement with full audit trails.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Role-Based Access',
    desc: 'Employees, IT Managers, and Admins each see exactly what they need.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Real-Time Tracking',
    desc: 'Live dashboards surface bottlenecks before they become problems.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'SOC-2 compliant infrastructure with end-to-end encryption.',
  },
]

const STATS = [
  { value: '12k+', label: 'Assets Managed' },
  { value: '98%', label: 'Uptime SLA' },
  { value: '340+', label: 'Organizations' },
  { value: '4.9★', label: 'Avg Rating' },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

export default function LandingPage({ onNavigate }) {
  const navigate = onNavigate || ((page) => console.log('navigate to', page))
  const [heroReady, setHeroReady] = useState(false)
  const [isCheckingBackend, setIsCheckingBackend] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Preparing secure connection...')
  const [loaderMessage, setLoaderMessage] = useState('Waking up server. This can take up to a minute on free tier hosting.')
  const [loaderError, setLoaderError] = useState('')
  const [statsRef, statsInView] = useInView()
  const [featRef, featInView] = useInView()
  const [ctaRef, ctaInView] = useInView()

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t) }, [])

  useEffect(() => {
    pingHealth().catch(() => {})
  }, [])

  const ensureBackendReadyThenNavigate = async (target) => {
    setIsCheckingBackend(true)
    setLoaderError('')
    setLoaderTitle('Connecting to AssetHub backend...')

    const startedAt = Date.now()
    let attempt = 1

    while (Date.now() - startedAt < HEALTH_CHECK_MAX_WAIT_MS) {
      setLoaderMessage(
        `Starting services (attempt ${attempt}). Render free tier may need 30-60 seconds after inactivity.`
      )

      const isReady = await pingHealth()
      if (isReady) {
        setLoaderTitle('Ready! Redirecting...')
        setLoaderMessage('Backend is awake. Taking you to authentication.')
        await wait(250)
        setIsCheckingBackend(false)
        navigate(target)
        return
      }

      attempt += 1
      await wait(HEALTH_CHECK_INTERVAL_MS)
    }

    setLoaderError('Backend is still waking up. Please wait a moment and try again.')
    setLoaderTitle('Server still starting')
    setLoaderMessage('Render free tier cold starts can take longer during high load.')
    setIsCheckingBackend(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .lp { font-family: 'DM Sans', sans-serif; background: #060c18; color: #e2e8f0; min-height: 100vh; overflow-x: hidden; }

        /* ── Noise overlay ── */
        .lp::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
        }

        /* ── Grid bg ── */
        .lp-grid-bg {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
        }

        /* ── Glow blobs ── */
        .lp-blob {
          position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
        }
        .lp-blob-1 {
          width: 520px; height: 420px; top: -100px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
        }
        .lp-blob-2 {
          width: 320px; height: 320px; bottom: 10%; right: 5%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
        }

        /* ── NAV ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 64px;
          background: rgba(6,12,24,0.75); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-icon {
          width: 32px; height: 32px; border-radius: 8px; background: #2563eb;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-logo-name {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px;
          color: #f8fafc; letter-spacing: -0.3px;
        }
        .lp-nav-actions { display: flex; align-items: center; gap: 10px; }
        .lp-btn-ghost {
          background: none; border: 1px solid rgba(255,255,255,0.12); color: #94a3b8;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          padding: 7px 18px; border-radius: 8px; cursor: pointer; transition: all 0.18s;
        }
        .lp-btn-ghost:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; border-color: rgba(255,255,255,0.22); }
        .lp-btn-primary {
          background: #2563eb; color: #fff; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: all 0.18s;
        }
        .lp-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.35); }

        /* ── HERO ── */
        .lp-hero {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: calc(100vh - 64px); padding: 80px 5vw 60px;
          text-align: center;
        }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(37,99,235,0.14); border: 1px solid rgba(37,99,235,0.3);
          border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 500;
          color: #93c5fd; letter-spacing: 0.04em; margin-bottom: 28px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s 0.05s, transform 0.5s 0.05s;
        }
        .lp-badge.show { opacity: 1; transform: translateY(0); }
        .lp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

        .lp-hero-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(40px, 7vw, 80px); line-height: 1.05; letter-spacing: -2px;
          color: #f8fafc; max-width: 820px;
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.65s 0.15s, transform 0.65s 0.15s;
        }
        .lp-hero-title.show { opacity: 1; transform: translateY(0); }
        .lp-hero-title .accent {
          background: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .lp-hero-sub {
          margin-top: 22px; font-size: 17px; font-weight: 300; line-height: 1.65;
          color: #64748b; max-width: 520px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.65s 0.28s, transform 0.65s 0.28s;
        }
        .lp-hero-sub.show { opacity: 1; transform: translateY(0); }

        .lp-hero-cta {
          display: flex; align-items: center; gap: 12px; margin-top: 40px; flex-wrap: wrap; justify-content: center;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.65s 0.38s, transform 0.65s 0.38s;
        }
        .lp-hero-cta.show { opacity: 1; transform: translateY(0); }

        .lp-cta-primary {
          background: #2563eb; color: #fff; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          padding: 13px 30px; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 0 0 0 rgba(37,99,235,0);
        }
        .lp-cta-primary:hover {
          background: #1d4ed8; transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,99,235,0.4);
        }
        .lp-cta-secondary {
          background: rgba(255,255,255,0.05); color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          padding: 13px 28px; border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .lp-cta-secondary:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: rgba(255,255,255,0.2); }

        /* ── STATS ── */
        .lp-stats {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-stat {
          background: #060c18; padding: 36px 24px; text-align: center;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s, transform 0.5s;
        }
        .lp-stat.show { opacity: 1; transform: translateY(0); }
        .lp-stat:nth-child(1) { transition-delay: 0.05s; }
        .lp-stat:nth-child(2) { transition-delay: 0.13s; }
        .lp-stat:nth-child(3) { transition-delay: 0.21s; }
        .lp-stat:nth-child(4) { transition-delay: 0.29s; }
        .lp-stat-value {
          font-family: 'Syne', sans-serif; font-size: 34px; font-weight: 800;
          color: #f8fafc; letter-spacing: -1px;
        }
        .lp-stat-label { font-size: 12px; color: #475569; margin-top: 5px; letter-spacing: 0.06em; text-transform: uppercase; }

        /* ── FEATURES ── */
        .lp-features {
          position: relative; z-index: 2;
          padding: 100px 5vw;
        }
        .lp-section-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #3b82f6; margin-bottom: 14px;
        }
        .lp-section-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(28px, 4vw, 42px); letter-spacing: -1px; color: #f1f5f9;
          max-width: 420px; line-height: 1.1;
          opacity: 0; transform: translateX(-18px);
          transition: opacity 0.6s 0.05s, transform 0.6s 0.05s;
        }
        .lp-section-title.show { opacity: 1; transform: translateX(0); }
        .lp-features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px; margin-top: 52px;
        }
        .lp-feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 26px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          opacity: 0; transform: translateY(24px);
        }
        .lp-feature-card.show { opacity: 1; transform: translateY(0); }
        .lp-feature-card:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); transform: translateY(-3px); }
        .lp-feature-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa; margin-bottom: 18px;
        }
        .lp-feature-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .lp-feature-desc { font-size: 13px; font-weight: 300; color: #64748b; line-height: 1.6; }

        /* ── ROLES ── */
        .lp-roles {
          position: relative; z-index: 2;
          padding: 60px 5vw 100px;
        }
        .lp-roles-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: center;
        }
        .lp-role-list { display: flex; flex-direction: column; gap: 14px; margin-top: 36px; }
        .lp-role-item {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .lp-role-item:hover { border-color: rgba(255,255,255,0.14); }
        .lp-role-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .lp-role-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
        .lp-role-desc { font-size: 12px; color: #64748b; line-height: 1.5; }

        /* visual card */
        .lp-visual-card {
          background: #0f172a; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 28px; position: relative; overflow: hidden;
        }
        .lp-visual-card::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%);
        }
        .lp-mock-topbar { display: flex; align-items: center; gap: 7px; margin-bottom: 20px; }
        .lp-mock-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-mock-row {
          height: 10px; border-radius: 4px; background: rgba(255,255,255,0.07); margin-bottom: 9px;
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.6 }
          50% { opacity: 1 }
        }
        .lp-mock-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;
          display: flex; align-items: center; gap: 12px;
        }
        .lp-mock-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #818cf8); flex-shrink: 0;
        }
        .lp-mock-line-sm { height: 8px; border-radius: 3px; background: rgba(255,255,255,0.1); }
        .lp-mock-badge {
          margin-left: auto; font-size: 10px; font-weight: 600;
          padding: 3px 8px; border-radius: 4px; white-space: nowrap;
        }

        /* ── CTA STRIP ── */
        .lp-cta-strip {
          position: relative; z-index: 2;
          margin: 0 5vw 80px;
          background: linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(99,102,241,0.15) 100%);
          border: 1px solid rgba(99,102,241,0.25); border-radius: 20px;
          padding: 56px 48px; text-align: center; overflow: hidden;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.65s, transform 0.65s;
        }
        .lp-cta-strip.show { opacity: 1; transform: translateY(0); }
        .lp-cta-strip::before {
          content: ''; position: absolute; inset: 0; border-radius: 20px; pointer-events: none;
          background: radial-gradient(ellipse 70% 60% at 50% -10%, rgba(37,99,235,0.18), transparent);
        }
        .lp-cta-strip-title {
          font-family: 'Syne', sans-serif; font-size: clamp(24px, 3.5vw, 38px); font-weight: 800;
          letter-spacing: -1px; color: #f8fafc; position: relative;
        }
        .lp-cta-strip-sub {
          font-size: 15px; font-weight: 300; color: #64748b;
          margin-top: 10px; margin-bottom: 32px; position: relative;
        }
        .lp-cta-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; position: relative; }

        /* ── FOOTER ── */
        .lp-footer {
          border-top: 1px solid rgba(255,255,255,0.06); padding: 28px 5vw;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 2;
        }
        .lp-footer-copy { font-size: 12px; color: #334155; }

        /* ── Loader modal ── */
        .lp-loader-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(2, 6, 23, 0.72);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .lp-loader-modal {
          width: min(460px, 100%);
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 14px;
          padding: 22px 20px;
          box-shadow: 0 16px 60px rgba(2, 6, 23, 0.5);
        }
        .lp-loader-head {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 12px;
        }
        .lp-loader-spinner {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(148, 163, 184, 0.35);
          border-top-color: #60a5fa;
          animation: lp-spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        .lp-loader-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: -0.3px;
        }
        .lp-loader-text {
          font-size: 13.5px;
          color: #94a3b8;
          line-height: 1.6;
        }
        .lp-loader-note {
          margin-top: 10px;
          font-size: 12px;
          color: #64748b;
        }
        .lp-loader-error {
          margin-top: 14px;
          font-size: 12.5px;
          color: #fca5a5;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(127, 29, 29, 0.2);
          border-radius: 8px;
          padding: 9px 10px;
        }
        @keyframes lp-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .lp-stats { grid-template-columns: repeat(2, 1fr); }
          .lp-roles-inner { grid-template-columns: 1fr; }
          .lp-visual-card { display: none; }
          .lp-cta-strip { padding: 36px 24px; margin: 0 4vw 60px; }
        }
        @media (max-width: 480px) {
          .lp-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav className="lp-nav">
          <a className="lp-logo" href="#">
            <div className="lp-logo-icon">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="white">
                <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v3H3V5zm0 5h14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"/>
              </svg>
            </div>
            <span className="lp-logo-name">AssetHub</span>
          </a>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => ensureBackendReadyThenNavigate('login')}>Sign in</button>
            <button className="lp-btn-primary" onClick={() => ensureBackendReadyThenNavigate('signup')}>Get started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero" style={{ position: 'relative' }}>
          <div className="lp-grid-bg"/>
          <div className="lp-blob lp-blob-1"/>
          <div className="lp-blob lp-blob-2"/>

          <div className={`lp-badge ${heroReady ? 'show' : ''}`} style={{ position: 'relative', zIndex: 2 }}>
            <span className="lp-badge-dot"/>
            Made with ❤️ By Sachin & Team.
          </div>

          <h1 className={`lp-hero-title ${heroReady ? 'show' : ''}`} style={{ position: 'relative', zIndex: 2 }}>
            Manage every<br/>asset, <span className="accent">effortlessly.</span>
          </h1>

          <p className={`lp-hero-sub ${heroReady ? 'show' : ''}`} style={{ position: 'relative', zIndex: 2 }}>
            AssetHub gives your team a single source of truth for all organizational assets — from laptops to licenses.
          </p>

          <div className={`lp-hero-cta ${heroReady ? 'show' : ''}`} style={{ position: 'relative', zIndex: 2 }}>
            <button className="lp-cta-primary" onClick={() => ensureBackendReadyThenNavigate('signup')}>
              Create free account
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="lp-cta-secondary" onClick={() => ensureBackendReadyThenNavigate('login')}>
              Sign in to your account
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'bounce 2s infinite' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
          <style>{`@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(5px)}}`}</style>
        </section>

        {/* STATS */}
        <div ref={statsRef} className="lp-stats" style={{ position: 'relative', zIndex: 2 }}>
          {STATS.map((s, i) => (
            <div key={i} className={`lp-stat ${statsInView ? 'show' : ''}`}>
              <div className="lp-stat-value">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section className="lp-features" ref={featRef}>
          <p className="lp-section-eyebrow">Why AssetHub</p>
          <h2 className={`lp-section-title ${featInView ? 'show' : ''}`}>
            Built for modern ops teams.
          </h2>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`lp-feature-card ${featInView ? 'show' : ''}`}
                style={{ transitionDelay: featInView ? `${0.08 + i * 0.1}s` : '0s' }}
              >
                <div className="lp-feature-icon">{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ROLES */}
        <section className="lp-roles">
          <div className="lp-roles-inner">
            <div>
              <p className="lp-section-eyebrow">Access Levels</p>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1px', color: '#f1f5f9', lineHeight: 1.1 }}>
                The right view for every role.
              </h2>
              <div className="lp-role-list">
                {[
                  { dot: '#34d399', name: 'Employee', desc: 'Submit requests, view assigned assets, track status.', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)' },
                  { dot: '#f59e0b', name: 'IT Manager', desc: 'Manage asset lifecycle, approve requests, run reports.', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                  { dot: '#f87171', name: 'Admin', desc: 'Full system control, user management, audit logs.', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
                ].map(r => (
                  <div key={r.name} className="lp-role-item" style={{ '--hover-bg': r.bg }}>
                    <span className="lp-role-dot" style={{ background: r.dot }}/>
                    <div>
                      <div className="lp-role-name">{r.name}</div>
                      <div className="lp-role-desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock UI */}
            <div className="lp-visual-card">
              <div className="lp-mock-topbar">
                <div className="lp-mock-dot" style={{ background: '#f87171' }}/>
                <div className="lp-mock-dot" style={{ background: '#f59e0b' }}/>
                <div className="lp-mock-dot" style={{ background: '#34d399' }}/>
                <div style={{ marginLeft: 8, height: 8, width: 120, borderRadius: 4, background: 'rgba(255,255,255,0.07)' }}/>
              </div>

              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Asset Dashboard</div>
                <div style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 4, padding: '3px 8px' }}>● Live</div>
              </div>

              {/* Mini stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
                {[['48', 'Active', '#3b82f6'], ['7', 'Pending', '#f59e0b'], ['3', 'Flagged', '#f87171']].map(([n, l, c]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: c }}>{n}</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Asset rows */}
              {[
                { name: 'MacBook Pro 14"', user: 'J. Mehta', status: 'Assigned', statusColor: '#34d399', statusBg: 'rgba(52,211,153,0.12)' },
                { name: 'Dell Monitor 27"', user: 'S. Rathod', status: 'In Review', statusColor: '#f59e0b', statusBg: 'rgba(245,158,11,0.12)' },
                { name: 'Logitech MX Keys', user: 'P. Sharma', status: 'Assigned', statusColor: '#34d399', statusBg: 'rgba(52,211,153,0.12)' },
              ].map((a, i) => (
                <div key={i} className="lp-mock-card">
                  <div className="lp-mock-avatar" style={{ background: `hsl(${220 + i * 30},70%,55%)` }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0', marginBottom: 3 }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{a.user}</div>
                  </div>
                  <div className="lp-mock-badge" style={{ background: a.statusBg, color: a.statusColor, border: `1px solid ${a.statusColor}33` }}>
                    {a.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <div ref={ctaRef} className={`lp-cta-strip ${ctaInView ? 'show' : ''}`}>
          <div className="lp-cta-strip-title">Ready to take control?</div>
          <div className="lp-cta-strip-sub">Join hundreds of organizations already running on AssetHub.</div>
          <div className="lp-cta-row">
            <button className="lp-cta-primary" onClick={() => ensureBackendReadyThenNavigate('signup')}>
              Create your account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="lp-cta-secondary" onClick={() => ensureBackendReadyThenNavigate('login')}>Already have an account</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="lp-logo-icon" style={{ width: 24, height: 24, borderRadius: 6 }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="white">
                <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v3H3V5zm0 5h14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: '#334155' }}>AssetHub</span>
          </div>
          <div className="lp-footer-copy">© Made By Sachin.❤️</div>
        </footer>

        {isCheckingBackend && (
          <div className="lp-loader-overlay" role="dialog" aria-modal="true" aria-live="polite">
            <div className="lp-loader-modal">
              <div className="lp-loader-head">
                <div className="lp-loader-spinner" />
                <div className="lp-loader-title">{loaderTitle}</div>
              </div>
              <div className="lp-loader-text">{loaderMessage}</div>
              <div className="lp-loader-note">Render free tier requires cold start after inactivity. Thanks for your patience.</div>
              {loaderError && <div className="lp-loader-error">{loaderError}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
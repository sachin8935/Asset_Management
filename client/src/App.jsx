import { useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from './hooks/useAuth'
import AssetAssignmentPage from './pages/AssetAssignmentPage'
import AssetInventoryPage from './pages/AssetInventoryPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeAssetPage from './pages/EmployeeAssetPage'
import IssueManagementPage from './pages/IssueManagementPage'
import IssueReportingPage from './pages/IssueReportingPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import UserManagementPage from './pages/UserManagementPage'

// ─── Global design-system styles (shared with child pages) ────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: linear-gradient(160deg, #fdf8f3 0%, #f5ede2 55%, #fdf8f3 100%);
      min-height: 100vh;
      color: #1a1612;
      -webkit-font-smoothing: antialiased;
    }

    .ds-display,
    .aas-display,
    .ais-display,
    .dss-display,
    .ims-display,
    .ris-display,
    .mhs-display,
    .maa-display,
    .ump-display {
      font-family: 'DM Sans', sans-serif !important;
      font-stretch: normal;
      letter-spacing: normal;
    }

    .aas-btn-primary,
    .ais-btn-primary,
    .ims-btn-primary,
    .ump-btn-primary,
    .ris-btn-primary,
    .ds-brand-name,
    .ds-avatar,
    .dss-stat-value {
      font-family: 'DM Sans', sans-serif !important;
      font-stretch: normal;
      letter-spacing: normal;
    }

    /* ── Sidebar ── */
    .ds-sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; width: 232px;
      background: #1a1612;
      display: flex; flex-direction: column;
      z-index: 100;
      box-shadow: 4px 0 32px rgba(26,22,18,0.18);
    }

    .ds-sidebar-brand {
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .ds-brand-icon {
      width: 42px; height: 42px; border-radius: 12px;
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      box-shadow: none;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .ds-brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 18px; font-weight: 800; color: #fff;
      letter-spacing: -0.03em; line-height: 1;
    }
    .ds-brand-sub {
      font-size: 11px; color: #6b5f55;
      font-weight: 500; letter-spacing: 0.08em;
      text-transform: uppercase; margin-top: 3px;
    }

    /* ── Nav ── */
    .ds-nav { flex: 1; padding: 14px 12px; overflow-y: auto; }

    .ds-nav-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: #4a3f37;
      padding: 0 8px; margin: 16px 0 6px;
    }
    .ds-nav-section-label:first-child { margin-top: 4px; }

    .ds-navlink {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 10px 10px 12px; border-radius: 12px;
      font-size: 13.5px; font-weight: 400; color: #8a7a70;
      text-decoration: none; transition: all 0.15s;
      margin-bottom: 2px; cursor: pointer;
    }
    .ds-navlink:hover { background: rgba(255,255,255,0.06); color: #d4c9c0; }
    .ds-navlink.active {
      background: rgba(255,107,53,0.15);
      color: #ff8a5c;
      font-weight: 500;
    }
    .ds-navlink.active .ds-nav-icon { color: #ff6b35; }
    .ds-navlink .ds-nav-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #ff6b35; flex-shrink: 0;
      opacity: 0; transition: opacity 0.15s;
    }
    .ds-navlink.active .ds-nav-dot { opacity: 1; }
    .ds-nav-icon {
      width: 16px; height: 16px; color: #5a4d45;
      transition: color 0.15s; flex-shrink: 0;
    }

    /* ── User footer in sidebar ── */
    .ds-sidebar-footer {
      padding: 14px 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .ds-user-chip {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 10px; border-radius: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      margin-bottom: 8px;
    }
    .ds-avatar {
      width: 32px; height: 32px; border-radius: 10px;
      background: linear-gradient(135deg, #ff6b35, #e8430f);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
      color: white; flex-shrink: 0;
    }
    .ds-user-name {
      font-size: 13px; font-weight: 500; color: #d4c9c0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-user-role {
      font-size: 11px; color: #5a4d45; font-weight: 400;
    }
    .ds-logout-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 14px; border-radius: 10px;
      background: transparent; border: 1px solid rgba(255,255,255,0.08);
      color: #6b5f55; font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500; cursor: pointer;
      transition: all 0.15s;
    }
    .ds-logout-btn:hover {
      background: rgba(255, 90, 80, 0.1);
      border-color: rgba(255,90,80,0.25);
      color: #ff7a70;
    }

    /* ── Main layout ── */
    .ds-layout {
      display: flex; min-height: 100vh;
    }
    .ds-main {
      margin-left: 232px;
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
    }

    /* ── Topbar ── */
    .ds-topbar {
      position: sticky; top: 0; z-index: 50;
      height: 60px; padding: 0 28px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(253,248,243,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(240,236,230,0.8);
    }
    .ds-breadcrumb {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #a09188;
    }
    .ds-breadcrumb-sep { color: #d4c9c0; font-size: 16px; }
    .ds-breadcrumb-current {
      font-family: 'Syne', sans-serif;
      font-size: 14px; font-weight: 700; color: #1a1612;
    }
    .ds-topbar-right {
      display: flex; align-items: center; gap: 10px;
    }
    .ds-topbar-role-pill {
      padding: 4px 12px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600;
      letter-spacing: 0.01em;
    }
    .role-Admin        { background: #fff0f0; color: #c0392b; }
    .role-ITManager    { background: #fff8ec; color: #b7640a; }
    .role-Employee     { background: #ecfdf5; color: #0a7a4e; }

    /* ── Page content area ── */
    .ds-page-content {
      flex: 1;
      padding: 32px 28px 64px;
    }

    /* ── Mobile sidebar toggle ── */
    .ds-mobile-toggle {
      display: none; position: fixed; bottom: 20px; right: 20px; z-index: 200;
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg,#ff6b35,#e8430f);
      border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(255,107,53,0.4);
      align-items: center; justify-content: center;
      color: white;
    }
    .ds-mobile-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(26,22,18,0.55); z-index: 99;
    }

    @media (max-width: 768px) {
      .ds-sidebar { transform: translateX(-100%); transition: transform 0.22s ease; }
      .ds-sidebar.open { transform: translateX(0); }
      .ds-main { margin-left: 0; }
      .ds-mobile-toggle { display: flex; }
      .ds-mobile-overlay.open { display: block; }
      .ds-page-content { padding: 20px 16px 80px; }
      .ds-topbar { padding: 0 16px; }
    }
  `}</style>
)

// ─── SVG icon helper ──────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const ICONS = {
  dashboard:    'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  assets:       'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  assignments:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  myAssets:     'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z',
  reportIssue:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  issues:       'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01',
  users:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  logout:       'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  logo:         'M3 5a2 2 0 012-2h10a2 2 0 012 2v3H3V5zm0 5h14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z',
  menu:         'M3 12h18M3 6h18M3 18h18',
  chevRight:    'M9 18l6-6-6-6',
}

// ─── Nav section config ───────────────────────────────────────────────────────
function buildNavSections(canManageAssets, isAdmin) {
  const sections = []

  if (canManageAssets) {
    sections.push({
      label: 'Management',
      links: [
        { to: '/dashboard',   label: 'Dashboard',        icon: 'dashboard'   },
        { to: '/assets',      label: 'Asset Inventory',  icon: 'assets'      },
        { to: '/assignments', label: 'Assignments',       icon: 'assignments' },
        { to: '/issues',      label: 'Issue Management', icon: 'issues'      },
      ],
    })
  }

  sections.push({
    label: 'My Workspace',
    links: [
      { to: '/my-assets',     label: 'My Assets',       icon: 'myAssets'    },
      { to: '/report-issues', label: 'Report an Issue', icon: 'reportIssue' },
    ],
  })

  if (isAdmin) {
    sections.push({
      label: 'Admin',
      links: [
        { to: '/users', label: 'User Management', icon: 'users' },
      ],
    })
  }

  return sections
}

// ─── Label map for breadcrumb ─────────────────────────────────────────────────
const ROUTE_LABELS = {
  '/dashboard':    'Dashboard',
  '/assets':       'Asset Inventory',
  '/assignments':  'Assignments',
  '/my-assets':    'My Assets',
  '/report-issues':'Report Issue',
  '/issues':       'Issue Management',
  '/users':        'User Management',
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

// ─── Role pill class ──────────────────────────────────────────────────────────
function rolePillClass(role) {
  if (role === 'Admin') return 'role-Admin'
  if (role === 'IT Manager') return 'role-ITManager'
  return 'role-Employee'
}

// ─── Protected route ─────────────────────────────────────────────────────────
function ProtectedRoute({ isAuthenticated, currentUser, allowedRoles, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/my-assets" replace />
  }
  return children
}

function PublicLandingRoute({ isAuthenticated, defaultPath }) {
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to={defaultPath} replace />
  }

  return (
    <LandingPage
      onNavigate={(target) => {
        const mode = target === 'signup' ? 'signup' : 'login'
        navigate('/login', { state: { mode } })
      }}
    />
  )
}

// ─── App shell ────────────────────────────────────────────────────────────────
function AppShell({ currentUser, onLogout, children }) {
  const location = useLocation()
  const canManageAssets = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager'
  const isAdmin = currentUser?.role === 'Admin'
  const navSections = buildNavSections(canManageAssets, isAdmin)
  const pageLabel = ROUTE_LABELS[location.pathname] || 'AssetHub'

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <GlobalStyles />

      {/* Mobile overlay */}
      <div
        className={`ds-mobile-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="ds-layout">

        {/* ── Sidebar ── */}
        <aside className={`ds-sidebar ${sidebarOpen ? 'open' : ''}`}>

          {/* Brand */}
          <div className="ds-sidebar-brand">
            <div className="ds-brand-icon">
              <img
                src="/logo.png"
                alt="AssetHub logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className="ds-brand-name ds-display">AssetHub</div>
            <div className="ds-brand-sub">Asset Management</div>
          </div>

          {/* Navigation */}
          <nav className="ds-nav">
            {navSections.map(({ label, links }) => (
              <div key={label}>
                <div className="ds-nav-section-label">{label}</div>
                {links.map(({ to, label: linkLabel, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `ds-navlink${isActive ? ' active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg className="ds-nav-icon" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICONS[icon]} />
                    </svg>
                    {linkLabel}
                    <span className="ds-nav-dot" style={{ marginLeft: 'auto' }} />
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User + logout */}
          <div className="ds-sidebar-footer">
            <div className="ds-user-chip">
              <div className="ds-avatar ds-display">{initials(currentUser?.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="ds-user-name">{currentUser?.name}</div>
                <div className="ds-user-role">{currentUser?.role}</div>
              </div>
            </div>
            <button className="ds-logout-btn" onClick={onLogout}>
              <Ico d={ICONS.logout} size={14} color="currentColor" />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main column ── */}
        <div className="ds-main">

          {/* Sticky topbar */}
          <header className="ds-topbar">
            <div className="ds-breadcrumb">
              <span>AssetHub</span>
              <span className="ds-breadcrumb-sep">/</span>
              <span className="ds-breadcrumb-current">{pageLabel}</span>
            </div>
            <div className="ds-topbar-right">
              <span className={`ds-topbar-role-pill ${rolePillClass(currentUser?.role)}`}>
                {currentUser?.role}
              </span>
              <div className="ds-avatar ds-display" style={{ width: 30, height: 30, fontSize: 11, borderRadius: 8 }}>
                {initials(currentUser?.name)}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="ds-page-content">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="ds-mobile-toggle" onClick={() => setSidebarOpen(v => !v)}>
        <Ico d={ICONS.menu} size={20} color="white" sw={2} />
      </button>
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { token, currentUser, isAuthenticated, loading, login, signup, logout } = useAuth()
  const canManageAssets = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager'
  const defaultPath = canManageAssets ? '/dashboard' : '/my-assets'

  return (
    <Routes>
      <Route
        path="/"
        element={<PublicLandingRoute isAuthenticated={isAuthenticated} defaultPath={defaultPath} />}
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={defaultPath} replace />
            : <LoginPage loading={loading} onLogin={login} onSignup={signup} />
        }
      />

      <Route
        path="*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser}>
            <AppShell currentUser={currentUser} onLogout={logout}>
              <Routes>
                <Route path="/" element={<Navigate to={defaultPath} replace />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['Admin', 'IT Manager']}>
                      <DashboardPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/assets"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['Admin', 'IT Manager']}>
                      <AssetInventoryPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/assignments"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['Admin', 'IT Manager']}>
                      <AssetAssignmentPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route path="/my-assets"     element={<EmployeeAssetPage    token={token} />} />
                <Route path="/report-issues" element={<IssueReportingPage   token={token} />} />

                <Route
                  path="/issues"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['Admin', 'IT Manager']}>
                      <IssueManagementPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['Admin']}>
                      <UserManagementPage token={token} currentUser={currentUser} />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to={defaultPath} replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
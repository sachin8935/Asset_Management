import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import StatusMessage from '../components/StatusMessage'

// ─── Role access guide shown in the left panel ────────────────────────────────
const ROLE_GUIDE = [
  {
    key: 'employee',
    dot: '#34d399',
    title: 'Employee',
    desc: 'Can sign up & log in. Submit requests and track personal assets.',
  },
  {
    key: 'it',
    dot: '#f59e0b',
    title: 'IT Manager',
    desc: 'Login only. Manages asset lifecycle and assignments.',
  },
  {
    key: 'admin',
    dot: '#f87171',
    title: 'Admin',
    desc: 'Login only. Full system access and user management.',
  },
]

// ─── Left-panel feature row ───────────────────────────────────────────────────
const Feature = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569', flexShrink: 0 }}/>
    {text}
  </div>
)

// ─── Main page — same props as original ──────────────────────────────────────
function LoginPage({ loading, onLogin, onSignup }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Track which role is active so the left panel can highlight it
  const [activeRole, setActiveRole] = useState('employee')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'Employee',
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Keep left-panel guide in sync with role selection
    if (field === 'role') {
      const map = { Employee: 'employee', 'IT Manager': 'it', Admin: 'admin' }
      setActiveRole(map[value] || 'employee')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        await onLogin({ email: form.email, password: form.password, expectedRole: form.role })
        setMessage('Login successful')
      } else {
        await onSignup(form)
        setMessage('Account created successfully')
        setMode('login')
        setForm(prev => ({ ...prev, name: '', email: '', password: '', department: '', role: 'Employee' }))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const switchMode = (tab) => {
    setMode(tab)
    setError('')
    setMessage('')
    if (tab === 'signup') {
      setForm(prev => ({ ...prev, role: 'Employee' }))
      setActiveRole('employee')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .lp-root * { box-sizing: border-box; font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .lp-tab:hover { color: #374151 !important; }
        .lp-role-card { transition: background 0.15s, border-color 0.15s; }
      `}</style>

      <div className="lp-root" style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 340,
          flexShrink: 0,
          background: '#0f172a',
          color: '#f1f5f9',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          // Hide on small screens via inline — for full responsiveness add a CSS class
        }}
          className="lp-left-panel"
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v3H3V5zm0 5h14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                  AssetHub
                </div>
                <div style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Enterprise Inventory
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 12, lineHeight: 1.6 }}>
              Inventory system for modern organizations
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Feature text="Role-based secure access" />
            <Feature text="Real-time asset tracking" />
            <Feature text="Scalable enterprise system" />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#1e293b' }}/>

          {/* Role access guide */}
          <div>
            <p style={{
              fontSize: 10, color: '#475569', letterSpacing: '0.09em',
              textTransform: 'uppercase', marginBottom: 12,
            }}>
              Access levels
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLE_GUIDE.map(r => {
                const isActive = activeRole === r.key && mode === 'login'
                return (
                  <div
                    key={r.key}
                    className="lp-role-card"
                    style={{
                      background: isActive ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `0.5px solid ${isActive ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: r.dot, flexShrink: 0, marginTop: 4,
                    }}/>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                        {r.desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <p style={{ marginTop: 'auto', fontSize: 11, color: '#334155' }}>
            © 2026 AssetHub · v2.4.1
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          background: '#fff',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4,
              background: '#f1f5f9', borderRadius: 10,
              padding: 4, marginBottom: 24,
            }}>
              {[
                { key: 'login', label: 'Sign in' },
                { key: 'signup', label: 'Register', badge: 'Employees' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="lp-tab"
                  onClick={() => switchMode(tab.key)}
                  style={{
                    flex: 1, border: 'none', cursor: 'pointer', borderRadius: 7,
                    padding: '8px 12px', fontSize: 13, fontWeight: 500,
                    fontFamily: 'inherit',
                    color: mode === tab.key ? '#0f172a' : '#6b7280',
                    background: mode === tab.key ? '#fff' : 'transparent',
                    boxShadow: mode === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {tab.label}
                  {tab.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 500,
                      padding: '2px 6px', borderRadius: 4,
                      background: '#dcfce7', color: '#15803d',
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Card */}
            <div style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <LoginForm
                mode={mode}
                form={form}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />

              {/* Status messages */}
              <div style={{ marginTop: error || message ? 12 : 0 }}>
                {error && <StatusMessage type="error" text={error} />}
                {message && <StatusMessage type="success" text={message} />}
              </div>
            </div>

            {/* Mode switch helper text */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
              {mode === 'login' ? (
                <>New employee?{' '}
                  <span
                    onClick={() => switchMode('signup')}
                    style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Create an account
                  </span>
                </>
              ) : (
                <>Already have an account?{' '}
                  <span
                    onClick={() => switchMode('login')}
                    style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Sign in
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
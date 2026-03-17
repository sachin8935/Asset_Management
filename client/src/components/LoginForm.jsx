import { useState } from 'react'
import { ROLE_OPTIONS } from '../constants/roles'

// ─── Role visual metadata ─────────────────────────────────────────────────────
const ROLE_META = {
  Employee:     { dot: '#34d399', icon: '👤', note: 'Self-service' },
  'IT Manager': { dot: '#f59e0b', icon: '🖥️', note: 'Asset mgmt' },
  Admin:        { dot: '#f87171', icon: '🔑', note: 'Full control' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
)
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 10-16 0"/>
  </svg>
)
const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
)
const EyeIcon = ({ visible }) => visible ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

// ─── Loading spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display: 'inline-block',
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'lf-spin 0.7s linear infinite',
  }}/>
)

// ─── Field with icon + optional password toggle ───────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, Icon, optional, required: req = true }) {
  const [showPwd, setShowPwd] = useState(false)
  const isPwd = type === 'password'
  const inputType = isPwd ? (showPwd ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontSize: 12, fontWeight: 500, color: '#6b7280',
        marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {label}
        {optional && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(optional)</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            <Icon />
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={req}
          className="lf-input"
          style={{
            width: '100%',
            padding: `9px ${isPwd ? '36px' : '12px'} 9px ${Icon ? '34px' : '12px'}`,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 13,
            background: '#fff',
            color: '#111827',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 2, display: 'flex', alignItems: 'center',
            }}
          >
            <EyeIcon visible={showPwd} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Password strength bar (signup only) ─────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Too weak', 'Fair', 'Good', 'Strong']
  const color = colors[score - 1] || '#e5e7eb'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? color : '#e5e7eb',
            transition: 'background 0.2s',
          }}/>
        ))}
      </div>
      <span style={{ fontSize: 11, color }}>{labels[score - 1] || ''}</span>
    </div>
  )
}

// ─── Role tile selector (login only) ─────────────────────────────────────────
function RoleSelector({ value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 8 }}>
        Sign in as
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ROLE_OPTIONS.length}, 1fr)`, gap: 8 }}>
        {ROLE_OPTIONS.map(role => {
          const meta = ROLE_META[role] || { dot: '#94a3b8', icon: '👤', note: '' }
          const selected = value === role
          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange('role', role)}
              style={{
                border: `1.5px solid ${selected ? meta.dot : '#e5e7eb'}`,
                borderRadius: 10,
                padding: '10px 6px',
                cursor: 'pointer',
                textAlign: 'center',
                background: selected ? `${meta.dot}18` : '#fff',
                transition: 'all 0.15s',
                position: 'relative',
                fontFamily: 'inherit',
              }}
            >
              {selected && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 14, height: 14, borderRadius: '50%',
                  background: meta.dot,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,5 4,8 8,2"/>
                  </svg>
                </span>
              )}
              <div style={{ fontSize: 18, marginBottom: 3 }}>{meta.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', marginBottom: 1 }}>{role}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{meta.note}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component — same props as original ──────────────────────────────────
function LoginForm({ mode, form, loading, onChange, onSubmit }) {
  const isSignup = mode === 'signup'

  return (
    <>
      <style>{`@keyframes lf-spin { to { transform: rotate(360deg); } }`}</style>
      <form onSubmit={onSubmit}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', margin: '0 0 4px' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            {isSignup
              ? 'Employee self-registration · takes 30 seconds'
              : 'Sign in to access your AssetHub dashboard'}
          </p>
        </div>

        {/* Employees-only notice on signup */}
        {isSignup && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 8, marginBottom: 16,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            fontSize: 12, color: '#1d4ed8', lineHeight: 1.5,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginTop: 1, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              Registration is for <strong>employees only</strong>. IT Managers &amp; Admins are provisioned by your system administrator.
            </span>
          </div>
        )}

        {/* ── LOGIN fields ── */}
        {!isSignup && (
          <>
            <RoleSelector value={form.role} onChange={onChange} />

            <Field
              label="Work email" type="email"
              value={form.email} onChange={v => onChange('email', v)}
              placeholder="you@company.com" Icon={MailIcon}
            />

            {/* Password row with forgot-password link */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Password</label>
                <button type="button" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: '#3b82f6', padding: 0, fontFamily: 'inherit',
                }}>
                  Forgot password?
                </button>
              </div>
              <Field
                type="password" value={form.password}
                onChange={v => onChange('password', v)}
                placeholder="••••••••" Icon={LockIcon}
              />
            </div>
          </>
        )}

        {/* ── SIGNUP fields ── */}
        {isSignup && (
          <>
            {/* Split name into two inputs, recombined into form.name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="First name"
                value={form.name?.split(' ')[0] || ''}
                onChange={v => onChange('name', `${v} ${(form.name?.split(' ').slice(1) || []).join(' ')}`.trim())}
                placeholder="Sarah" Icon={UserIcon}
              />
              <Field
                label="Last name"
                value={(form.name?.split(' ').slice(1) || []).join(' ')}
                onChange={v => onChange('name', `${form.name?.split(' ')[0] || ''} ${v}`.trim())}
                placeholder="Connor" Icon={UserIcon}
              />
            </div>

            <Field
              label="Work email" type="email"
              value={form.email} onChange={v => onChange('email', v)}
              placeholder="you@company.com" Icon={MailIcon}
            />

            <Field
              label="Department" value={form.department}
              onChange={v => onChange('department', v)}
              placeholder="e.g. Engineering, Finance…"
              Icon={BuildingIcon} optional required={false}
            />

            {/* Password + strength */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                Password
              </label>
              <Field
                type="password" value={form.password}
                onChange={v => onChange('password', v)}
                placeholder="Min. 8 characters" Icon={LockIcon}
              />
              <PasswordStrength password={form.password} />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 11,
            border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 8, opacity: loading ? 0.8 : 1,
            background: isSignup ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#0f172a',
            color: 'white',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
        >
          {loading ? <Spinner /> : (isSignup ? 'Create my account' : 'Sign in to AssetHub')}
        </button>

        {isSignup && (
          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
            By registering you agree to our{' '}
            <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        )}
      </form>
    </>
  )
}

export default LoginForm
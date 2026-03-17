import { useState } from 'react'

import StatusMessage from '../components/StatusMessage'
import UserTable from '../components/UserTable'
import PaginationControls from '../components/PaginationControls'
import { ROLE_OPTIONS } from '../constants/roles'
import { useUserManagement } from '../hooks/useUserManagement'

// ─── Font + global styles ─────────────────────────────────────────────────────
const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    .ump-root * { box-sizing: border-box; }
    .ump-root { font-family: 'DM Sans', sans-serif; }
    .ump-display { font-family: 'Syne', sans-serif; }

    .ump-input {
      width: 100%; padding: 11px 14px 11px 40px;
      font-family: 'DM Sans', sans-serif; font-size: 14px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 12px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ump-input::placeholder { color: #c2bcb3; }
    .ump-input:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }

    .ump-btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 11px 22px;
      background: linear-gradient(135deg, #ff6b35 0%, #e8430f 100%);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 14px rgba(255,107,53,0.35);
      transition: all 0.15s;
    }
    .ump-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
    .ump-btn-primary:active { transform: scale(0.98); }
    .ump-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .ump-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; background: transparent; color: #6b6560;
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
      border: 1.5px solid #ede9e2; border-radius: 12px; cursor: pointer;
      transition: all 0.15s;
    }
    .ump-btn-ghost:hover { border-color: #d0c9bf; background: #faf9f7; color: #1a1612; }

    .ump-card {
      background: #ffffff; border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
    }

    .role-toggle-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 16px; border-radius: 14px; border: 2px solid #ede9e2;
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.15s; background: #faf9f7; color: #8a837a;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ump-form-panel { animation: slideDown 0.2s ease; }

    @keyframes ump-spin { to { transform: rotate(360deg); } }
    .ump-spin { animation: ump-spin 0.7s linear infinite; }
  `}</style>
)

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const P = {
  user:   'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  email:  'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  lock:   'M19 11H5M12 3a4 4 0 014 4v4H8V7a4 4 0 014-4zM5 11a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2',
  dept:   'M4 7h16M4 12h10M4 17h6',
  eyeOn:  'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22',
  plus:   'M12 5v14M5 12h14',
  check:  'M20 6L9 17l-5-5',
  close:  'M18 6L6 18M6 6l12 12',
  users2: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  bar:    'M18 20V10M12 20V4M6 20v-6',
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, optional, iconPath, children }) {
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 600,
        letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9a928a',
      }}>
        {label}
        {optional && (
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#c2bcb3', marginLeft: 4 }}>
            · optional
          </span>
        )}
      </label>
      <div style={{ position: 'relative' }}>
        {iconPath && (
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex',
          }}>
            <Ico d={iconPath} size={15} color="#c2bcb3" />
          </span>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Role pill ────────────────────────────────────────────────────────────────
const ROLE_META = {
  Admin:        { bg: '#fff0f0', color: '#c0392b', dot: '#e74c3c' },
  'IT Manager': { bg: '#fff8ec', color: '#b7640a', dot: '#f39c12' },
  Employee:     { bg: '#ecfdf5', color: '#0a7a4e', dot: '#27ae60' },
}

function RolePill({ role }) {
  const s = ROLE_META[role] || { bg: '#f3f4f6', color: '#555', dot: '#aaa' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px 3px 7px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {role}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ color = 'white' }) => (
  <span className="ump-spin" style={{
    display: 'inline-block', width: 15, height: 15,
    border: `2px solid ${color === 'white' ? 'rgba(255,255,255,0.35)' : '#e8e2db'}`,
    borderTopColor: color === 'white' ? 'white' : '#ff6b35',
    borderRadius: '50%',
  }} />
)

// ─── Main ─────────────────────────────────────────────────────────────────────
function UserManagementPage({ token, currentUser }) {
  const [newUserName,       setNewUserName]       = useState('')
  const [newUserEmail,      setNewUserEmail]      = useState('')
  const [newUserPassword,   setNewUserPassword]   = useState('')
  const [newUserDepartment, setNewUserDepartment] = useState('')
  const [newUserRole,       setNewUserRole]       = useState('IT Manager')
  const [error,      setError]      = useState('')
  const [message,    setMessage]    = useState('')
  const [page,       setPage]       = useState(1)
  const [formOpen,   setFormOpen]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)

  const perPage = 10

  const {
    users, pagination, usersLoading,
    roleDraft, setRoleDraft,
    updateRole, createUser, loadUsers,
  } = useUserManagement(token, true)

  // ── handlers — same logic as original ──────────────────────────────────
  const handleCreateUser = async (event) => {
    event.preventDefault()
    setError(''); setMessage(''); setSubmitting(true)
    try {
      const data = await createUser({
        name: newUserName, email: newUserEmail,
        password: newUserPassword, department: newUserDepartment, role: newUserRole,
      })
      setMessage(`${data.user.role} account created for ${data.user.name}`)
      setNewUserName(''); setNewUserEmail(''); setNewUserPassword('')
      setNewUserDepartment(''); setNewUserRole('IT Manager')
      setFormOpen(false)
      if (page !== 1) setPage(1)
      await loadUsers({ page: 1, per_page: perPage })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleUpdate = async (userId) => {
    setError(''); setMessage('')
    try {
      const data = await updateRole(userId, roleDraft[userId])
      setMessage(`Role updated for ${data.user.name}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRoleDraftChange = (userId, role) => {
    setRoleDraft(prev => ({ ...prev, [userId]: role }))
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadUsers({ page: nextPage, per_page: perPage })
  }

  // ── derived ───────────────────────────────────────────────────────────
  const totalUsers = pagination?.total ?? users?.length ?? 0
  const roleCount  = (role) => (users || []).filter(u => u.role === role).length

  const stats = [
    { label: 'Total users',  value: totalUsers,              gradient: 'linear-gradient(135deg,#1a1612,#3d2e26)', valColor: '#fff',    subColor: '#a0948c', icon: P.bar    },
    { label: 'IT Managers',  value: roleCount('IT Manager'), gradient: 'linear-gradient(135deg,#fffbf0,#fef3c7)', valColor: '#78450a', subColor: '#c99a3a', icon: P.shield },
    { label: 'Employees',    value: roleCount('Employee'),   gradient: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)', valColor: '#065f46', subColor: '#16a075', icon: P.users2 },
    { label: 'Admins',       value: roleCount('Admin'),      gradient: 'linear-gradient(135deg,#fff5f5,#fecaca)', valColor: '#7f1d1d', subColor: '#dc2626', icon: P.shield },
  ]

  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <PageStyles />
      <div className="ump-root" style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#fdf8f3 0%,#f5ede2 55%,#fdf8f3 100%)',
        padding: '36px 20px 72px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* ── Page header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, marginBottom: 28,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                }}>
                  <Ico d={P.users2} size={20} color="white" strokeWidth={2} />
                </div>
                <h1 className="ump-display" style={{
                  fontSize: 30, fontWeight: 800, color: '#1a1612',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  User Management
                </h1>
              </div>
              <p style={{ fontSize: 14, color: '#8a837a', fontWeight: 300, paddingLeft: 54 }}>
                Provision accounts and manage roles across your organisation
              </p>
            </div>

            <button className="ump-btn-primary" onClick={() => setFormOpen(v => !v)}>
              <Ico d={formOpen ? P.close : P.plus} size={15} color="white" strokeWidth={2.5} />
              {formOpen ? 'Discard' : 'Add new user'}
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))',
            gap: 14, marginBottom: 26,
          }}>
            {stats.map(({ label, value, gradient, valColor, subColor, icon }) => (
              <div key={label} style={{
                background: gradient, borderRadius: 18, padding: '18px 20px',
                position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{
                      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em',
                      textTransform: 'uppercase', color: subColor, marginBottom: 8,
                    }}>
                      {label}
                    </p>
                    <p className="ump-display" style={{ fontSize: 36, fontWeight: 800, color: valColor, lineHeight: 1 }}>
                      {value}
                    </p>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ico d={icon} size={16} color={valColor} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Status ── */}
          {(error || message) && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {error   && <StatusMessage type="error"   text={error}   />}
              {message && <StatusMessage type="success" text={message} />}
            </div>
          )}

          {/* ── Create user form ── */}
          {formOpen && (
            <div className="ump-card ump-form-panel" style={{ marginBottom: 24, overflow: 'hidden' }}>

              {/* Form header */}
              <div style={{
                padding: '20px 26px 18px',
                background: 'linear-gradient(135deg,#fff8f5,#fff3ee)',
                borderBottom: '1px solid #f0ece6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <h2 className="ump-display" style={{ fontSize: 17, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.02em' }}>
                    New user account
                  </h2>
                  <p style={{ fontSize: 12.5, color: '#9a928a', marginTop: 2, fontWeight: 300 }}>
                    Fill in the details below to provision access
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(255,107,53,0.1)', color: '#e8430f',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Admin action
                </span>
              </div>

              <form onSubmit={handleCreateUser} style={{ padding: '22px 26px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))',
                  gap: 16, marginBottom: 20,
                }}>
                  <Field label="Full name" iconPath={P.user}>
                    <input className="ump-input" type="text" value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="Sarah Connor" required />
                  </Field>

                  <Field label="Work email" iconPath={P.email}>
                    <input className="ump-input" type="email" value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      placeholder="sarah@company.com" required />
                  </Field>

                  <Field label="Password" iconPath={P.lock}>
                    <input className="ump-input" type={showPwd ? 'text' : 'password'}
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      placeholder="Min. 8 characters" required
                      style={{ paddingRight: 42 }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: 2,
                    }}>
                      <Ico d={showPwd ? P.eyeOff : P.eyeOn} size={15} color="#c2bcb3" />
                    </button>
                  </Field>

                  <Field label="Department" optional iconPath={P.dept}>
                    <input className="ump-input" type="text" value={newUserDepartment}
                      onChange={e => setNewUserDepartment(e.target.value)}
                      placeholder="e.g. Engineering" />
                  </Field>
                </div>

                {/* Role picker */}
                <div style={{ marginBottom: 22 }}>
                  <p style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: '#9a928a', marginBottom: 10,
                  }}>Assign role</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { role: 'IT Manager', activeBg: '#fff8ec', activeBorder: '#f39c12', activeColor: '#8a5a00', dot: '#f39c12' },
                      { role: 'Employee',   activeBg: '#ecfdf5', activeBorder: '#27ae60', activeColor: '#065f46', dot: '#27ae60' },
                    ].map(({ role, activeBg, activeBorder, activeColor, dot }) => {
                      const sel = newUserRole === role
                      return (
                        <button key={role} type="button" className="role-toggle-btn"
                          onClick={() => setNewUserRole(role)}
                          style={sel ? {
                            borderColor: activeBorder, background: activeBg,
                            color: activeColor, fontWeight: 600,
                          } : {}}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: sel ? dot : '#d5cec6', transition: 'background 0.15s',
                          }} />
                          {role}
                          {sel && <Ico d={P.check} size={13} color={activeColor} strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'flex-end', gap: 10,
                  paddingTop: 18, borderTop: '1px solid #f0ece6',
                }}>
                  <button type="button" className="ump-btn-ghost" onClick={() => setFormOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ump-btn-primary" disabled={submitting}>
                    {submitting
                      ? <><Spinner /> Creating…</>
                      : <><Ico d={P.check} size={15} color="white" strokeWidth={2.5} /> Create user</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Users table ── */}
          <div className="ump-card" style={{ overflow: 'hidden' }}>

            {/* Table header */}
            <div style={{
              padding: '18px 26px',
              borderBottom: '1px solid #f0ece6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <h2 className="ump-display" style={{ fontSize: 17, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.02em' }}>
                  All users
                </h2>
                {!usersLoading && (
                  <p style={{ fontSize: 12, color: '#9a928a', marginTop: 2, fontWeight: 300 }}>
                    {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
                    {pagination ? ` · page ${page} of ${Math.ceil(totalUsers / perPage) || 1}` : ''}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.keys(ROLE_META).map(role => <RolePill key={role} role={role} />)}
              </div>
            </div>

            {/* Loading */}
            {usersLoading ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, padding: '72px 24px', color: '#9a928a', fontSize: 14,
              }}>
                <Spinner color="orange" />
                Loading users…
              </div>

            /* Empty */
            ) : !users?.length ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '72px 24px', textAlign: 'center',
              }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 22,
                  background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                  border: '1.5px solid #f9d4c3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Ico d={P.users2} size={30} color="#ff6b35" />
                </div>
                <p className="ump-display" style={{ fontSize: 18, fontWeight: 700, color: '#1a1612', marginBottom: 6 }}>
                  No users yet
                </p>
                <p style={{ fontSize: 13.5, color: '#9a928a', maxWidth: 280, fontWeight: 300, lineHeight: 1.6 }}>
                  Hit <strong style={{ color: '#ff6b35' }}>Add new user</strong> above to provision your first account.
                </p>
              </div>

            /* Table */
            ) : (
              <UserTable
                users={users}
                currentUserId={currentUser?.id}
                roleOptions={ROLE_OPTIONS}
                roleDraft={roleDraft}
                onRoleDraftChange={handleRoleDraftChange}
                onUpdateRole={handleRoleUpdate}
              />
            )}

            {/* Pagination */}
            {!usersLoading && !!users?.length && (
              <div style={{
                padding: '14px 26px',
                borderTop: '1px solid #f0ece6',
                background: '#faf9f7',
              }}>
                <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default UserManagementPage
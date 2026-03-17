import { useEffect, useState } from 'react'

import { fetchAssets } from '../services/assetService'
import PaginationControls from './PaginationControls'
import {
  assignAssetToEmployee,
  fetchAllAssignments,
  returnAssignedAsset,
} from '../services/assignmentService'
import { fetchAllUsers } from '../services/adminService'

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Ico = ({ d, size = 15, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const P = {
  asset:    'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  link:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  check:    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  undo:     'M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6',
  chevron:  'M19 9l-7 7-7-7',
  warning:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  ok:       'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
}

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .aas-root * { box-sizing: border-box; }
    .aas-root { font-family: 'DM Sans', sans-serif; }
    .aas-display { font-family: 'Syne', sans-serif; }

    .aas-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .aas-card-header {
      padding: 20px 26px 18px;
      border-bottom: 1px solid #f0ece6;
      background: linear-gradient(135deg, #fff8f5, #fff3ee);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
    }

    .aas-select {
      width: 100%;
      padding: 10px 36px 10px 38px;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 12px; color: #1a1612; outline: none;
      appearance: none; cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .aas-select:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }
    .aas-select option { color: #1a1612; background: #fff; }

    .aas-date-input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 12px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .aas-date-input:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }

    .aas-field-wrap { position: relative; }
    .aas-field-icon {
      position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; align-items: center; color: #c2bcb3;
    }
    .aas-field-chevron {
      position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; align-items: center; color: #c2bcb3;
    }

    .aas-btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 22px;
      background: linear-gradient(135deg, #ff6b35, #e8430f);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 14px rgba(255,107,53,0.32);
      transition: all 0.15s; white-space: nowrap;
    }
    .aas-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
    .aas-btn-primary:active { transform: scale(0.98); }
    .aas-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .aas-btn-return {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      background: #fff8f5; border: 1.5px solid #ffd5c2;
      color: #c84b10; font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
    }
    .aas-btn-return:hover { background: #fff0e8; border-color: #ffb899; }

    .aas-table { width: 100%; border-collapse: collapse; }
    .aas-table th {
      padding: 11px 16px; text-align: left;
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .aas-table th:first-child { padding-left: 24px; border-radius: 0; }
    .aas-table th:last-child { padding-right: 24px; text-align: center; }
    .aas-table td {
      padding: 13px 16px; font-size: 13.5px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .aas-table td:first-child { padding-left: 24px; }
    .aas-table td:last-child { padding-right: 24px; text-align: center; }
    .aas-table tbody tr:last-child td { border-bottom: none; }
    .aas-table tbody tr:hover td { background: #fdf8f5; }

    .aas-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .aas-badge-returned { background: #ecfdf5; color: #0a7a4e; }
    .aas-badge-active   { background: #fff8ec; color: #b7640a; }

    .aas-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 8px;
      background: #f5f0eb; color: #6b5f55;
      font-size: 11.5px; font-weight: 600; font-family: 'DM Mono', monospace;
    }

    .aas-status-bar {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 16px; border-radius: 12px; font-size: 13px;
    }
    .aas-status-error   { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .aas-status-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    .aas-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 56px 24px; text-align: center;
    }
    .aas-empty-icon {
      width: 60px; height: 60px; border-radius: 18px;
      background: linear-gradient(135deg, #fff3ee, #ffe8dc);
      border: 1.5px solid #f9d4c3;
      display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
    }

    @keyframes aas-spin { to { transform: rotate(360deg); } }
    .aas-spin {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%;
      animation: aas-spin 0.7s linear infinite;
    }

    .aas-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 12px; align-items: end;
    }

    @media (max-width: 860px) {
      .aas-form-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 520px) {
      .aas-form-grid { grid-template-columns: 1fr; }
    }
  `}</style>
)

// ─── Field label ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children, optional }) => (
  <label style={{
    display: 'block', marginBottom: 6,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: '#9a928a',
  }}>
    {children}
    {optional && (
      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#c2bcb3', marginLeft: 4 }}>
        · optional
      </span>
    )}
  </label>
)

// ─── Status bar ───────────────────────────────────────────────────────────────
const StatusBar = ({ type, text }) => {
  if (!text) return null
  const isError = type === 'error'
  return (
    <div className={`aas-status-bar ${isError ? 'aas-status-error' : 'aas-status-success'}`}>
      <Ico d={isError ? P.warning : P.ok} size={15} color={isError ? '#dc2626' : '#16a34a'} />
      <span>{text}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
function AssetAssignmentSection({ token }) {
  const [assets,      setAssets]      = useState([])
  const [employees,   setEmployees]   = useState([])
  const [assignments, setAssignments] = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [message,     setMessage]     = useState('')

  const [assetId,      setAssetId]      = useState('')
  const [employeeId,   setEmployeeId]   = useState('')
  const [assignedDate, setAssignedDate] = useState('')
  const [page,         setPage]         = useState(1)
  const [submitting,   setSubmitting]   = useState(false)

  const perPage = 10

  // ── same logic as original ───────────────────────────────────────────────
  const loadData = async (nextPage = page) => {
    setLoading(true)
    try {
      const [assetData, userData, assignmentData] = await Promise.all([
        fetchAssets(token, { page: 1, per_page: 200 }),
        fetchAllUsers(token, { page: 1, per_page: 200 }),
        fetchAllAssignments(token, { page: nextPage, per_page: perPage }),
      ])
      setAssets(assetData.assets || [])
      setEmployees((userData.users || []).filter(user => user.role === 'Employee'))
      setAssignments(assignmentData.assignments || [])
      setPagination(assignmentData.pagination || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [token])

  const handleAssign = async (event) => {
    event.preventDefault()
    setError(''); setMessage(''); setSubmitting(true)
    try {
      if (!assetId || !employeeId) throw new Error('Please select both asset and employee')
      await assignAssetToEmployee(token, {
        asset_id:      Number(assetId),
        employee_id:   Number(employeeId),
        assigned_date: assignedDate || undefined,
      })
      setMessage('Asset assigned successfully')
      setAssetId(''); setEmployeeId(''); setAssignedDate('')
      await loadData(page)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async (assignmentId) => {
    setError(''); setMessage('')
    try {
      await returnAssignedAsset(token, assignmentId, {})
      setMessage('Asset returned successfully')
      await loadData(page)
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadData(nextPage)
  }

  const assignableAssets = assets.filter(a => a.status !== 'Assigned')

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="aas-root">

        {/* ── Section heading ── */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
          }}>
            <Ico d={P.link} size={18} color="white" sw={2} />
          </div>
          <div>
            <h2 className="aas-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Asset Assignment
            </h2>
            <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
              Assign available assets to employees and manage returns
            </p>
          </div>
        </div>

        {/* ── Assign form card ── */}
        <div className="aas-card">
          <div className="aas-card-header">
            <div>
              <p className="aas-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
                New assignment
              </p>
              <p style={{ fontSize: 12, color: '#9a928a', fontWeight: 300, marginTop: 2 }}>
                {assignableAssets.length} asset{assignableAssets.length !== 1 ? 's' : ''} available · {employees.length} employee{employees.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,107,53,0.1)', color: '#e8430f',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              IT / Admin only
            </span>
          </div>

          <form onSubmit={handleAssign} style={{ padding: '20px 24px' }}>
            <div className="aas-form-grid">

              {/* Asset select */}
              <div>
                <FieldLabel>Asset</FieldLabel>
                <div className="aas-field-wrap">
                  <span className="aas-field-icon"><Ico d={P.asset} size={14} color="#c2bcb3" /></span>
                  <select className="aas-select" value={assetId}
                    onChange={e => setAssetId(e.target.value)} required>
                    <option value="">Select asset…</option>
                    {assignableAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_name} ({asset.serial_number})
                      </option>
                    ))}
                  </select>
                  <span className="aas-field-chevron"><Ico d={P.chevron} size={13} color="#c2bcb3" /></span>
                </div>
              </div>

              {/* Employee select */}
              <div>
                <FieldLabel>Employee</FieldLabel>
                <div className="aas-field-wrap">
                  <span className="aas-field-icon"><Ico d={P.user} size={14} color="#c2bcb3" /></span>
                  <select className="aas-select" value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)} required>
                    <option value="">Select employee…</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  <span className="aas-field-chevron"><Ico d={P.chevron} size={13} color="#c2bcb3" /></span>
                </div>
              </div>

              {/* Date */}
              <div>
                <FieldLabel optional>Assigned date</FieldLabel>
                <div className="aas-field-wrap">
                  <span className="aas-field-icon"><Ico d={P.calendar} size={14} color="#c2bcb3" /></span>
                  <input type="date" className="aas-date-input" value={assignedDate}
                    onChange={e => setAssignedDate(e.target.value)} />
                </div>
              </div>

              {/* Submit */}
              <div style={{ paddingBottom: 0 }}>
                <button type="submit" className="aas-btn-primary" disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  {submitting
                    ? <><span className="aas-spin" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Assigning…</>
                    : <><Ico d={P.link} size={14} color="white" sw={2.2} /> Assign Asset</>
                  }
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Status messages ── */}
        {(error || message) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <StatusBar type="error"   text={error}   />
            <StatusBar type="success" text={message} />
          </div>
        )}

        {/* ── Assignments table ── */}
        <div className="aas-card">
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid #f0ece6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p className="aas-display" style={{ fontSize: 15, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
              Assignment records
            </p>
            {pagination && (
              <p style={{ fontSize: 12, color: '#9a928a', fontWeight: 300 }}>
                {pagination.total ?? assignments.length} total · page {page}
              </p>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 24px', color: '#9a928a', fontSize: 13 }}>
              <span className="aas-spin" />
              Loading assignment data…
            </div>

          ) : assignments.length === 0 ? (
            <div className="aas-empty">
              <div className="aas-empty-icon">
                <Ico d={P.link} size={26} color="#ff6b35" />
              </div>
              <p className="aas-display" style={{ fontSize: 16, fontWeight: 700, color: '#1a1612', marginBottom: 5 }}>
                No assignments yet
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 260, fontWeight: 300, lineHeight: 1.6 }}>
                Use the form above to assign your first asset to an employee.
              </p>
            </div>

          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="aas-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Asset</th>
                      <th>Employee</th>
                      <th>Assigned</th>
                      <th>Returned</th>
                      <th>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.id}>
                        <td><span className="aas-id-chip">{a.id}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 9,
                              background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                              border: '1px solid #f9d4c3',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Ico d={P.asset} size={13} color="#ff6b35" />
                            </div>
                            <span style={{ fontWeight: 500 }}>{a.asset?.asset_name || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: '#1a1612',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                              fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700, color: 'white',
                            }}>
                              {(a.employee?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <span>{a.employee?.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#6b5f55', fontSize: 13 }}>
                          {a.assigned_date || <span style={{ color: '#c2bcb3' }}>—</span>}
                        </td>
                        <td style={{ color: '#6b5f55', fontSize: 13 }}>
                          {a.return_date || <span style={{ color: '#c2bcb3' }}>—</span>}
                        </td>
                        <td>
                          {a.return_date ? (
                            <span className="aas-badge aas-badge-returned">
                              <Ico d={P.check} size={12} color="#16a34a" />
                              Returned
                            </span>
                          ) : (
                            <button className="aas-btn-return" onClick={() => handleReturn(a.id)}>
                              <Ico d={P.undo} size={12} color="#c84b10" />
                              Mark returned
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '12px 24px', borderTop: '1px solid #f0ece6', background: '#faf9f7' }}>
                <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}

export default AssetAssignmentSection
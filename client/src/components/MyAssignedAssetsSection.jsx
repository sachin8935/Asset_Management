import { useEffect, useState } from 'react'

import { fetchMyAssignments } from '../services/assignmentService'
import PaginationControls from './PaginationControls'

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .maa-root * { box-sizing: border-box; }
    .maa-root { font-family: 'DM Sans', sans-serif; }
    .maa-display { font-family: 'Syne', sans-serif; }

    .maa-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
    }

    .maa-table { width: 100%; border-collapse: collapse; }
    .maa-table th {
      padding: 10px 14px; text-align: left;
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .maa-table th:first-child { padding-left: 22px; }
    .maa-table th:last-child  { padding-right: 22px; }
    .maa-table td {
      padding: 14px 14px; font-size: 13px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .maa-table td:first-child { padding-left: 22px; }
    .maa-table td:last-child  { padding-right: 22px; }
    .maa-table tbody tr:last-child td { border-bottom: none; }
    .maa-table tbody tr:hover td { background: #fdf8f5; }

    .maa-status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px 3px 7px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .maa-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    .maa-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 7px;
      border-radius: 7px; background: #f5f0eb; color: #6b5f55;
      font-size: 11px; font-weight: 600; font-family: monospace;
    }

    .maa-serial-chip {
      font-family: monospace; font-size: 12px; font-weight: 600;
      background: #f5f0eb; color: #6b5f55;
      padding: 2px 7px; border-radius: 6px;
    }

    .maa-alert-error {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 14px; border-radius: 12px; font-size: 13px;
      background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c;
      margin-bottom: 14px;
    }

    @keyframes maa-spin { to { transform: rotate(360deg); } }
    .maa-spinner {
      display: inline-block; width: 17px; height: 17px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: maa-spin 0.7s linear infinite; flex-shrink: 0;
    }

    .maa-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 64px 24px; text-align: center;
    }

    .maa-summary-strip {
      display: flex; gap: 12px; flex-wrap: wrap;
      padding: 14px 22px; border-bottom: 1px solid #f0ece6;
      background: #fdfcfb;
    }
    .maa-summary-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 500;
    }
  `}</style>
)

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Ico = ({ d, size = 14, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const P = {
  shield:   'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z',
  asset:    'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  tag:      'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
  serial:   'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  warning:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  undo:     'M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6',
  check:    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

// ─── Asset status badge config ────────────────────────────────────────────────
const STATUS_STYLES = {
  Available:    { bg: '#ecfdf5', color: '#0a7a4e', dot: '#22c55e' },
  Assigned:     { bg: '#fff8ec', color: '#b7640a', dot: '#f59e0b' },
  'In Repair':  { bg: '#fff3ee', color: '#c84b10', dot: '#ff6b35' },
  Retired:      { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' },
  Lost:         { bg: '#fff5f5', color: '#b91c1c', dot: '#ef4444' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' }
  return (
    <span className="maa-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="maa-status-dot" style={{ background: s.dot }} />
      {status || '—'}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
function MyAssignedAssetsSection({ token }) {
  const [assignments, setAssignments] = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [page,        setPage]        = useState(1)

  const perPage = 10

  // ── same logic as original ──────────────────────────────────────────────
  const loadAssignments = async (nextPage = page) => {
    setLoading(true); setError('')
    try {
      const data = await fetchMyAssignments(token, { page: nextPage, per_page: perPage })
      setAssignments(data.assignments || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [token])

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadAssignments(nextPage)
  }

  // ── derived ───────────────────────────────────────────────────────────
  const activeCount   = assignments.filter(a => !a.return_date).length
  const returnedCount = assignments.filter(a =>  a.return_date).length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="maa-root">

        {/* ── Section heading ── */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
          }}>
            <Ico d={P.shield} size={18} color="white" sw={2} />
          </div>
          <div>
            <h2 className="maa-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
              My Assigned Assets
            </h2>
            <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
              Assets currently or previously assigned to you
            </p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="maa-alert-error">
            <Ico d={P.warning} size={14} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Card ── */}
        <div className="maa-card">

          {/* Summary strip */}
          {!loading && assignments.length > 0 && (
            <div className="maa-summary-strip">
              <span className="maa-summary-pill" style={{ background: '#fff8ec', color: '#b7640a' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                {activeCount} active
              </span>
              <span className="maa-summary-pill" style={{ background: '#ecfdf5', color: '#0a7a4e' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                {returnedCount} returned
              </span>
              {pagination && (
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9a928a', alignSelf: 'center' }}>
                  {pagination.total ?? assignments.length} total · page {page} of {Math.ceil((pagination.total ?? assignments.length) / perPage) || 1}
                </span>
              )}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '64px 24px', color: '#9a928a', fontSize: 13 }}>
              <span className="maa-spinner" />
              Loading your assigned assets…
            </div>

          /* Empty */
          ) : assignments.length === 0 ? (
            <div className="maa-empty">
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                border: '1.5px solid #f9d4c3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Ico d={P.shield} size={28} color="#ff6b35" />
              </div>
              <p className="maa-display" style={{ fontSize: 17, fontWeight: 700, color: '#1a1612', marginBottom: 6 }}>
                No assets assigned
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 280, fontWeight: 300, lineHeight: 1.6 }}>
                You don't have any assets assigned to you yet. Contact your IT Manager to request one.
              </p>
            </div>

          /* Table */
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="maa-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Asset</th>
                      <th>Category</th>
                      <th>Serial no.</th>
                      <th>Asset status</th>
                      <th>Assigned</th>
                      <th>Returned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr key={assignment.id}>

                        {/* ID */}
                        <td><span className="maa-id-chip">{assignment.id}</span></td>

                        {/* Asset name */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 9,
                              background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                              border: '1px solid #f9d4c3',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Ico d={P.asset} size={14} color="#ff6b35" />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1a1612' }}>
                              {assignment.asset?.asset_name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          {assignment.asset?.category
                            ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#5a4d45' }}>
                                <Ico d={P.tag} size={11} color="#c2bcb3" />
                                {assignment.asset.category}
                              </span>
                            )
                            : <span style={{ color: '#c2bcb3' }}>—</span>}
                        </td>

                        {/* Serial */}
                        <td>
                          {assignment.asset?.serial_number
                            ? <span className="maa-serial-chip">{assignment.asset.serial_number}</span>
                            : <span style={{ color: '#c2bcb3' }}>—</span>}
                        </td>

                        {/* Asset status */}
                        <td><StatusBadge status={assignment.asset?.status} /></td>

                        {/* Assigned date */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b5f55', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                            <Ico d={P.calendar} size={12} color="#c2bcb3" />
                            {assignment.assigned_date || <span style={{ color: '#c2bcb3' }}>—</span>}
                          </div>
                        </td>

                        {/* Return date */}
                        <td>
                          {assignment.return_date ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '3px 9px 3px 7px', borderRadius: 20,
                                background: '#ecfdf5', color: '#0a7a4e',
                                fontSize: 11.5, fontWeight: 600,
                              }}>
                                <Ico d={P.check} size={12} color="#16a34a" />
                                {assignment.return_date}
                              </span>
                            </div>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 9px 3px 7px', borderRadius: 20,
                              background: '#fff8ec', color: '#b7640a',
                              fontSize: 11.5, fontWeight: 600,
                            }}>
                              <Ico d={P.undo} size={11} color="#d97706" />
                              Active
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '12px 22px', borderTop: '1px solid #f0ece6', background: '#faf9f7' }}>
                <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}

export default MyAssignedAssetsSection
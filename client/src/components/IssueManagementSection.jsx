import { useEffect, useState } from 'react'

import PaginationControls from './PaginationControls'
import { useIssueManagement } from '../hooks/useIssues'

// ─── Constants (unchanged) ────────────────────────────────────────────────────
const ISSUE_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .ims-root * { box-sizing: border-box; }
    .ims-root { font-family: 'DM Sans', sans-serif; }
    .ims-display { font-family: 'Syne', sans-serif; }

    .ims-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 18px;
    }

    .ims-search-row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      padding: 16px 22px; border-bottom: 1px solid #f0ece6;
      background: #fdfcfb;
    }

    .ims-input, .ims-select {
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 10px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      padding: 8px 13px 8px 34px;
    }
    .ims-input::placeholder { color: #c2bcb3; }
    .ims-input:focus, .ims-select:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }
    .ims-select { appearance: none; cursor: pointer; padding-right: 28px; }

    .ims-field { position: relative; display: inline-flex; align-items: center; }
    .ims-field-icon {
      position: absolute; left: 10px; pointer-events: none;
      display: flex; align-items: center; color: #c2bcb3; z-index: 1;
    }
    .ims-field-chevron {
      position: absolute; right: 9px; pointer-events: none;
      display: flex; align-items: center; color: #c2bcb3;
    }

    .ims-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(135deg,#ff6b35,#e8430f);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 10px; cursor: pointer;
      box-shadow: 0 3px 10px rgba(255,107,53,0.3);
      transition: all 0.15s; white-space: nowrap;
    }
    .ims-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(255,107,53,0.38); }
    .ims-btn-primary:active { transform: scale(0.98); }

    .ims-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; background: transparent;
      color: #6b6560; font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500;
      border: 1.5px solid #ede9e2; border-radius: 10px; cursor: pointer;
      transition: all 0.15s; white-space: nowrap;
    }
    .ims-btn-ghost:hover { border-color: #d0c9bf; background: #faf9f7; color: #1a1612; }

    .ims-btn-save {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 12px; border-radius: 8px;
      background: linear-gradient(135deg,#ff6b35,#e8430f);
      color: white; border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
      box-shadow: 0 2px 8px rgba(255,107,53,0.25);
      transition: all 0.15s; white-space: nowrap;
    }
    .ims-btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,107,53,0.35); }
    .ims-btn-save:active { transform: scale(0.98); }
    .ims-btn-save:disabled {
      background: #f0ece6; color: #c2bcb3; box-shadow: none;
      cursor: not-allowed; transform: none;
    }

    .ims-status-select {
      appearance: none; padding: 5px 26px 5px 10px;
      font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
      border-radius: 8px; border: 1.5px solid #ede9e2;
      background: #faf9f7; color: #1a1612; outline: none; cursor: pointer;
      transition: border-color 0.15s;
    }
    .ims-status-select:focus { border-color: #ff6b35; box-shadow: 0 0 0 2px rgba(255,107,53,0.1); }

    .ims-table { width: 100%; border-collapse: collapse; }
    .ims-table th {
      padding: 10px 14px; text-align: left;
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .ims-table th:first-child { padding-left: 22px; }
    .ims-table th:last-child  { padding-right: 22px; }
    .ims-table td {
      padding: 13px 14px; font-size: 13px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .ims-table td:first-child { padding-left: 22px; }
    .ims-table td:last-child  { padding-right: 22px; }
    .ims-table tbody tr:last-child td { border-bottom: none; }
    .ims-table tbody tr:hover td { background: #fdf8f5; }

    .ims-status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px 3px 7px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .ims-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    .ims-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 6px;
      border-radius: 7px; background: #f5f0eb; color: #6b5f55;
      font-size: 11px; font-weight: 600; font-family: monospace;
    }

    .ims-alert {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 14px; border-radius: 12px; font-size: 13px;
      margin-bottom: 14px;
    }
    .ims-alert-error   { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .ims-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    @keyframes ims-spin { to { transform: rotate(360deg); } }
    .ims-spinner {
      display: inline-block; width: 17px; height: 17px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: ims-spin 0.7s linear infinite; flex-shrink: 0;
    }

    .ims-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 56px 24px; text-align: center;
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
  issues:   'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01',
  filter:   'M3 4h18M7 8h10M11 12h4M13 16h2',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  clear:    'M18 6L6 18M6 6l12 12',
  check:    'M20 6L9 17l-5-5',
  warning:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  ok:       'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  asset:    'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  chevron:  'M19 9l-7 7-7-7',
  hash:     'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
}

// ─── Status visual config ─────────────────────────────────────────────────────
const STATUS_STYLES = {
  'Open':        { bg: '#fff5f5', color: '#b91c1c', dot: '#ef4444' },
  'In Progress': { bg: '#fff8ec', color: '#b7640a', dot: '#f59e0b' },
  'Resolved':    { bg: '#ecfdf5', color: '#0a7a4e', dot: '#22c55e' },
  'Closed':      { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' }
  return (
    <span className="ims-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="ims-status-dot" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const ini = (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: '#1a1612', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700,
      flexShrink: 0,
    }}>{ini}</div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function IssueManagementSection({ token }) {
  const { issues, pagination, loading, error, message, loadIssues, changeStatus } =
    useIssueManagement(token)

  // filter state (unchanged)
  const [statusFilter,     setStatusFilter]     = useState('')
  const [assetIdFilter,    setAssetIdFilter]    = useState('')
  const [employeeIdFilter, setEmployeeIdFilter] = useState('')

  // pending status changes (unchanged)
  const [statusDraft, setStatusDraft] = useState({})
  const [page,        setPage]        = useState(1)
  const [saving,      setSaving]      = useState({})

  const perPage = 10

  // ── same logic as original ──────────────────────────────────────────────
  useEffect(() => {
    loadIssues({ page: 1, per_page: perPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildFilters() {
    const f = {}
    if (statusFilter)     f.status      = statusFilter
    if (assetIdFilter)    f.asset_id    = Number(assetIdFilter)
    if (employeeIdFilter) f.employee_id = Number(employeeIdFilter)
    f.page     = page
    f.per_page = perPage
    return f
  }

  function handleApplyFilters(e) {
    e.preventDefault()
    setPage(1)
    loadIssues({ ...buildFilters(), page: 1, per_page: perPage })
  }

  function handleClearFilters() {
    setStatusFilter(''); setAssetIdFilter(''); setEmployeeIdFilter('')
    setPage(1)
    loadIssues({ page: 1, per_page: perPage })
  }

  function handleStatusDraftChange(issueId, value) {
    setStatusDraft(prev => ({ ...prev, [issueId]: value }))
  }

  async function handleStatusUpdate(issueId) {
    const newStatus = statusDraft[issueId]
    if (!newStatus) return
    setSaving(prev => ({ ...prev, [issueId]: true }))
    await changeStatus(issueId, newStatus)
    setStatusDraft(prev => { const next = { ...prev }; delete next[issueId]; return next })
    setSaving(prev => { const next = { ...prev }; delete next[issueId]; return next })
  }

  function handlePageChange(nextPage) {
    setPage(nextPage)
    loadIssues({
      status:      statusFilter      || undefined,
      asset_id:    assetIdFilter     ? Number(assetIdFilter)    : undefined,
      employee_id: employeeIdFilter  ? Number(employeeIdFilter) : undefined,
      page:        nextPage,
      per_page:    perPage,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="ims-root">

        {/* ── Section heading ── */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
          }}>
            <Ico d={P.issues} size={18} color="white" sw={2} />
          </div>
          <div>
            <h2 className="ims-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Issue Management
            </h2>
            <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
              Review, filter, and update the status of reported asset issues
            </p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="ims-alert ims-alert-error">
            <Ico d={P.warning} size={14} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="ims-alert ims-alert-success">
            <Ico d={P.ok} size={14} color="#16a34a" />
            <span>{message}</span>
          </div>
        )}

        {/* ── Main card ── */}
        <div className="ims-card">

          {/* Filter bar */}
          <form className="ims-search-row" onSubmit={handleApplyFilters}>

            {/* Status filter */}
            <div className="ims-field">
              <span className="ims-field-icon"><Ico d={P.filter} size={13} color="#c2bcb3" /></span>
              <select className="ims-select" style={{ minWidth: 150 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="ims-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
            </div>

            {/* Asset ID */}
            <div className="ims-field">
              <span className="ims-field-icon"><Ico d={P.hash} size={12} color="#c2bcb3" /></span>
              <input className="ims-input" type="number" placeholder="Asset ID"
                value={assetIdFilter} onChange={e => setAssetIdFilter(e.target.value)}
                style={{ width: 120 }} min={1} />
            </div>

            {/* Employee ID */}
            <div className="ims-field">
              <span className="ims-field-icon"><Ico d={P.hash} size={12} color="#c2bcb3" /></span>
              <input className="ims-input" type="number" placeholder="Employee ID"
                value={employeeIdFilter} onChange={e => setEmployeeIdFilter(e.target.value)}
                style={{ width: 130 }} min={1} />
            </div>

            <button type="submit" className="ims-btn-primary">
              <Ico d={P.search} size={13} color="white" />
              Apply
            </button>
            <button type="button" className="ims-btn-ghost" onClick={handleClearFilters}>
              <Ico d={P.clear} size={13} color="currentColor" />
              Clear
            </button>

            {/* Result count */}
            {!loading && pagination && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9a928a', whiteSpace: 'nowrap' }}>
                {pagination.total ?? issues.length} issue{(pagination.total ?? issues.length) !== 1 ? 's' : ''} · page {page}
              </span>
            )}
          </form>

          {/* Status legend */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 22px', borderBottom: '1px solid #f0ece6' }}>
            {ISSUE_STATUSES.map(s => <StatusBadge key={s} status={s} />)}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '60px 24px', color: '#9a928a', fontSize: 13 }}>
              <span className="ims-spinner" />
              Loading issues…
            </div>

          /* Empty */
          ) : issues.length === 0 ? (
            <div className="ims-empty">
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                border: '1.5px solid #f9d4c3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Ico d={P.issues} size={26} color="#ff6b35" />
              </div>
              <p className="ims-display" style={{ fontSize: 16, fontWeight: 700, color: '#1a1612', marginBottom: 5 }}>
                No issues found
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 260, fontWeight: 300, lineHeight: 1.6 }}>
                {statusFilter || assetIdFilter || employeeIdFilter
                  ? 'Try adjusting or clearing your filters.'
                  : 'No issues have been reported yet.'}
              </p>
            </div>

          /* Table */
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="ims-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Asset</th>
                      <th>Reported by</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Reported</th>
                      <th>Update status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => (
                      <tr key={issue.id}>

                        {/* ID */}
                        <td><span className="ims-id-chip">{issue.id}</span></td>

                        {/* Asset */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 9,
                              background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                              border: '1px solid #f9d4c3',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Ico d={P.asset} size={13} color="#ff6b35" />
                            </div>
                            <div>
                              <p style={{ fontWeight: 500, color: '#1a1612', lineHeight: 1.3 }}>
                                {issue.asset?.asset_name ?? `#${issue.asset_id}`}
                              </p>
                              {issue.asset?.serial_number && (
                                <p style={{ fontSize: 11, color: '#9a928a', fontFamily: 'monospace', marginTop: 1 }}>
                                  {issue.asset.serial_number}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Employee */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={issue.employee?.name} />
                            <div>
                              <p style={{ fontWeight: 500, color: '#1a1612', lineHeight: 1.3 }}>
                                {issue.employee?.name ?? `#${issue.employee_id}`}
                              </p>
                              {issue.employee?.email && (
                                <p style={{ fontSize: 11, color: '#9a928a', marginTop: 1 }}>
                                  {issue.employee.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td style={{ maxWidth: '26ch' }}>
                          <p style={{ fontSize: 13, color: '#3d332b', wordBreak: 'break-word', lineHeight: 1.5 }}>
                            {issue.issue_description}
                          </p>
                        </td>

                        {/* Current status */}
                        <td><StatusBadge status={issue.status} /></td>

                        {/* Date */}
                        <td style={{ color: '#6b5f55', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Ico d={P.calendar} size={12} color="#c2bcb3" />
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleDateString()
                              : '—'}
                          </div>
                        </td>

                        {/* Update status */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              <select
                                className="ims-status-select"
                                value={statusDraft[issue.id] ?? issue.status}
                                onChange={e => handleStatusDraftChange(issue.id, e.target.value)}
                              >
                                {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', display: 'flex' }}>
                                <Ico d={P.chevron} size={11} color="#c2bcb3" />
                              </span>
                            </div>
                            <button
                              className="ims-btn-save"
                              onClick={() => handleStatusUpdate(issue.id)}
                              disabled={
                                saving[issue.id] ||
                                !statusDraft[issue.id] ||
                                statusDraft[issue.id] === issue.status
                              }
                            >
                              {saving[issue.id]
                                ? <span style={{ display:'inline-block',width:11,height:11,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'white',borderRadius:'50%',animation:'ims-spin 0.7s linear infinite' }} />
                                : <Ico d={P.check} size={11} color="white" sw={2.5} />
                              }
                              {saving[issue.id] ? 'Saving…' : 'Save'}
                            </button>
                          </div>
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
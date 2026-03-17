import { useEffect, useState } from 'react'

import { fetchMyAssignments } from '../services/assignmentService'
import PaginationControls from './PaginationControls'
import { useMyIssues } from '../hooks/useIssues'

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .ris-root * { box-sizing: border-box; }
    .ris-root { font-family: 'DM Sans', sans-serif; }
    .ris-display { font-family: 'Syne', sans-serif; }

    .ris-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .ris-card-header {
      padding: 18px 24px 16px;
      border-bottom: 1px solid #f0ece6;
      background: linear-gradient(135deg,#fff8f5,#fff3ee);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px;
    }

    .ris-select, .ris-textarea {
      width: 100%;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 10px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ris-select {
      appearance: none; cursor: pointer;
      padding: 9px 32px 9px 36px;
    }
    .ris-select:focus, .ris-textarea:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }
    .ris-textarea {
      padding: 10px 13px; resize: vertical; min-height: 90px;
    }
    .ris-textarea::placeholder { color: #c2bcb3; }

    .ris-field { position: relative; }
    .ris-field-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3; z-index: 1;
    }
    .ris-field-chevron {
      position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3;
    }

    .ris-label {
      display: block; margin-bottom: 6px;
      font-size: 10.5px; font-weight: 700;
      letter-spacing: 0.07em; text-transform: uppercase; color: #9a928a;
    }

    .ris-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 22px;
      background: linear-gradient(135deg,#ff6b35,#e8430f);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 10px; cursor: pointer;
      box-shadow: 0 3px 10px rgba(255,107,53,0.3);
      transition: all 0.15s; white-space: nowrap;
    }
    .ris-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(255,107,53,0.38); }
    .ris-btn-primary:active { transform: scale(0.98); }
    .ris-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

    .ris-table { width: 100%; border-collapse: collapse; }
    .ris-table th {
      padding: 10px 14px; text-align: left;
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .ris-table th:first-child { padding-left: 22px; }
    .ris-table th:last-child  { padding-right: 22px; }
    .ris-table td {
      padding: 13px 14px; font-size: 13px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .ris-table td:first-child { padding-left: 22px; }
    .ris-table td:last-child  { padding-right: 22px; }
    .ris-table tbody tr:last-child td { border-bottom: none; }
    .ris-table tbody tr:hover td { background: #fdf8f5; }

    .ris-status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px 3px 7px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .ris-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    .ris-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 6px;
      border-radius: 7px; background: #f5f0eb; color: #6b5f55;
      font-size: 11px; font-weight: 600; font-family: monospace;
    }

    .ris-alert {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 14px;
    }
    .ris-alert-error   { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .ris-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .ris-alert-info    { background: #fff8ec; border: 1px solid #fde68a; color: #92610a; }

    @keyframes ris-spin { to { transform: rotate(360deg); } }
    .ris-spinner {
      display: inline-block; width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
      border-radius: 50%; animation: ris-spin 0.7s linear infinite; flex-shrink: 0;
    }
    .ris-spinner-muted {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: ris-spin 0.7s linear infinite; flex-shrink: 0;
    }

    .ris-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 56px 24px; text-align: center;
    }

    @keyframes ris-slide-down {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ris-slide-down { animation: ris-slide-down 0.18s ease; }
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
  warning2: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  report:   'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  asset:    'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  desc:     'M4 6h16M4 10h16M4 14h10',
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  check:    'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  ok:       'M20 6L9 17l-5-5',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  list:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  chevron:  'M19 9l-7 7-7-7',
  info:     'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01',
}

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  'Open':        { bg: '#fff5f5', color: '#b91c1c', dot: '#ef4444' },
  'In Progress': { bg: '#fff8ec', color: '#b7640a', dot: '#f59e0b' },
  'Resolved':    { bg: '#ecfdf5', color: '#0a7a4e', dot: '#22c55e' },
  'Closed':      { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' }
  return (
    <span className="ris-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="ris-status-dot" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReportIssueSection({ token }) {
  const { myIssues, pagination, loading, error, message, loadMyIssues, submitIssue } =
    useMyIssues(token)

  const [myAssets,      setMyAssets]      = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)

  // form state (unchanged)
  const [assetId,      setAssetId]      = useState('')
  const [description,  setDescription]  = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [formError,    setFormError]    = useState('')
  const [formMessage,  setFormMessage]  = useState('')
  const [page,         setPage]         = useState(1)

  const perPage = 10

  // ── same logic as original ──────────────────────────────────────────────
  useEffect(() => {
    loadMyIssues({ page: 1, per_page: perPage })
    loadMyAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadMyAssets() {
    setAssetsLoading(true)
    try {
      const data = await fetchMyAssignments(token, { page: 1, per_page: 200 })
      const active = data.assignments.filter(a => !a.return_date)
      setMyAssets(active)
    } catch {
      // silently fail — user may have no assigned assets
    } finally {
      setAssetsLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(''); setFormMessage('')
    if (!assetId)            { setFormError('Please select an asset.');      return }
    if (!description.trim()) { setFormError('Please describe the issue.');   return }

    setSubmitting(true)
    try {
      await submitIssue({ asset_id: Number(assetId), issue_description: description.trim() })
      setFormMessage(message || 'Issue reported successfully.')
      setAssetId(''); setDescription('')
      await loadMyIssues({ page, per_page: perPage })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadMyIssues({ page: nextPage, per_page: perPage })
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="ris-root">

        {/* ══ SECTION 1 — REPORT FORM ══════════════════════════════════════ */}

        {/* Heading */}
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
          }}>
            <Ico d={P.report} size={18} color="white" sw={2} />
          </div>
          <div>
            <h2 className="ris-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Report an Issue
            </h2>
            <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
              Flag a problem with one of your assigned assets
            </p>
          </div>
        </div>

        {/* Form alerts */}
        {formError && (
          <div className="ris-alert ris-alert-error ris-slide-down">
            <Ico d={P.warning2} size={14} color="#dc2626" />
            <span>{formError}</span>
          </div>
        )}
        {formMessage && (
          <div className="ris-alert ris-alert-success ris-slide-down">
            <Ico d={P.check} size={14} color="#16a34a" />
            <span>{formMessage}</span>
          </div>
        )}
        {error && (
          <div className="ris-alert ris-alert-error">
            <Ico d={P.warning2} size={14} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Report form card */}
        <div className="ris-card" style={{ marginBottom: 28 }}>
          <div className="ris-card-header">
            <div>
              <p className="ris-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
                New issue report
              </p>
              <p style={{ fontSize: 12, color: '#9a928a', fontWeight: 300, marginTop: 2 }}>
                Select the affected asset and describe what's wrong
              </p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,107,53,0.1)', color: '#e8430f',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Employee
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 16 }}>

              {/* Asset select */}
              <div>
                <label className="ris-label">Your asset</label>
                {assetsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: '#9a928a', fontSize: 13 }}>
                    <span className="ris-spinner-muted" />
                    Loading your assets…
                  </div>
                ) : myAssets.length === 0 ? (
                  <div className="ris-alert ris-alert-info" style={{ margin: 0 }}>
                    <Ico d={P.info} size={14} color="#b7640a" />
                    <span>You have no currently assigned assets to report an issue for.</span>
                  </div>
                ) : (
                  <div className="ris-field">
                    <span className="ris-field-icon"><Ico d={P.asset} size={13} color="#c2bcb3" /></span>
                    <select className="ris-select" value={assetId}
                      onChange={e => setAssetId(e.target.value)} required>
                      <option value="">— select asset —</option>
                      {myAssets.map(a => (
                        <option key={a.id} value={a.asset?.id ?? a.asset_id}>
                          {a.asset?.asset_name ?? `Asset #${a.asset_id}`}
                          {a.asset?.serial_number ? ` (${a.asset.serial_number})` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="ris-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="ris-label">Issue description</label>
                <div className="ris-field">
                  <textarea className="ris-textarea" rows={3}
                    placeholder="Describe the issue in detail — what's happening, when it started, any error messages…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #f0ece6' }}>
              <button
                type="submit"
                className="ris-btn-primary"
                disabled={submitting || myAssets.length === 0}
              >
                {submitting
                  ? <><span className="ris-spinner" /> Submitting…</>
                  : <><Ico d={P.send} size={13} color="white" sw={2} /> Submit issue</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* ══ SECTION 2 — MY ISSUES TABLE ══════════════════════════════════ */}

        {/* Sub-heading */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#1a1612',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ico d={P.list} size={18} color="white" sw={1.8} />
          </div>
          <div>
            <h2 className="ris-display" style={{ fontSize: 18, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
              My Reported Issues
            </h2>
            <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
              Track the status of issues you've submitted
            </p>
          </div>
        </div>

        <div className="ris-card">

          {/* Status legend */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 22px', borderBottom: '1px solid #f0ece6', background: '#fdfcfb' }}>
            {Object.keys(STATUS_STYLES).map(s => <StatusBadge key={s} status={s} />)}
            {!loading && pagination && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9a928a', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                {pagination.total ?? myIssues.length} issue{(pagination.total ?? myIssues.length) !== 1 ? 's' : ''} · page {page}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '56px 24px', color: '#9a928a', fontSize: 13 }}>
              <span className="ris-spinner-muted" />
              Loading your issues…
            </div>

          /* Empty */
          ) : myIssues.length === 0 ? (
            <div className="ris-empty">
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                border: '1.5px solid #f9d4c3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Ico d={P.list} size={26} color="#ff6b35" />
              </div>
              <p className="ris-display" style={{ fontSize: 16, fontWeight: 700, color: '#1a1612', marginBottom: 5 }}>
                No issues yet
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 270, fontWeight: 300, lineHeight: 1.6 }}>
                You haven't reported any issues. Use the form above if something's wrong with your asset.
              </p>
            </div>

          /* Table */
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="ris-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Asset</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myIssues.map(issue => (
                      <tr key={issue.id}>

                        {/* ID */}
                        <td><span className="ris-id-chip">{issue.id}</span></td>

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
                            <span style={{ fontWeight: 500, color: '#1a1612' }}>
                              {issue.asset?.asset_name ?? `#${issue.asset_id}`}
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td style={{ maxWidth: '28ch' }}>
                          <p style={{ fontSize: 13, color: '#5a4d45', wordBreak: 'break-word', lineHeight: 1.5 }}>
                            {issue.issue_description}
                          </p>
                        </td>

                        {/* Status */}
                        <td><StatusBadge status={issue.status} /></td>

                        {/* Date */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b5f55', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                            <Ico d={P.calendar} size={12} color="#c2bcb3" />
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleDateString()
                              : '—'}
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
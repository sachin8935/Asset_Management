import { useEffect, useMemo, useState } from 'react'

import { fetchAssets } from '../services/assetService'
import PaginationControls from './PaginationControls'
import {
  addMaintenanceRecord,
  fetchMaintenanceHistory,
} from '../services/maintenanceService'

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .mhs-root * { box-sizing: border-box; }
    .mhs-root { font-family: 'DM Sans', sans-serif; }
    .mhs-display { font-family: 'Syne', sans-serif; }

    .mhs-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 18px;
    }
    .mhs-card-header {
      padding: 18px 24px 16px;
      border-bottom: 1px solid #f0ece6;
      background: linear-gradient(135deg, #fff8f5, #fff3ee);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px;
    }

    .mhs-input, .mhs-select, .mhs-date, .mhs-textarea {
      width: 100%;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 10px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      padding: 9px 13px 9px 36px;
    }
    .mhs-input::placeholder, .mhs-textarea::placeholder { color: #c2bcb3; }
    .mhs-input:focus, .mhs-select:focus, .mhs-date:focus, .mhs-textarea:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }
    .mhs-select { appearance: none; cursor: pointer; padding-right: 30px; }
    .mhs-textarea { padding: 9px 13px; resize: vertical; min-height: 72px; }
    .mhs-input-bare { padding: 9px 13px; }

    .mhs-field { position: relative; }
    .mhs-field-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3; z-index: 1;
    }
    .mhs-field-chevron {
      position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3;
    }

    .mhs-label {
      display: block; margin-bottom: 5px;
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em;
      text-transform: uppercase; color: #9a928a;
    }
    .mhs-label-opt { font-weight: 400; text-transform: none; letter-spacing: 0; color: #c2bcb3; margin-left: 4px; }

    .mhs-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
    .mhs-form-full { grid-column: 1 / -1; }

    .mhs-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      background: linear-gradient(135deg, #ff6b35, #e8430f);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 10px; cursor: pointer;
      box-shadow: 0 3px 10px rgba(255,107,53,0.3);
      transition: all 0.15s; white-space: nowrap;
    }
    .mhs-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(255,107,53,0.38); }
    .mhs-btn-primary:active { transform: scale(0.98); }
    .mhs-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .mhs-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; background: transparent;
      color: #6b6560; font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500;
      border: 1.5px solid #ede9e2; border-radius: 10px; cursor: pointer;
      transition: all 0.15s; white-space: nowrap;
    }
    .mhs-btn-ghost:hover { border-color: #d0c9bf; background: #faf9f7; color: #1a1612; }

    .mhs-filter-row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      padding: 14px 22px; border-bottom: 1px solid #f0ece6; background: #fdfcfb;
    }

    .mhs-table { width: 100%; border-collapse: collapse; }
    .mhs-table th {
      padding: 10px 14px; text-align: left;
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .mhs-table th:first-child { padding-left: 22px; }
    .mhs-table th:last-child  { padding-right: 22px; text-align: right; }
    .mhs-table td {
      padding: 13px 14px; font-size: 13px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .mhs-table td:first-child { padding-left: 22px; }
    .mhs-table td:last-child  { padding-right: 22px; text-align: right; }
    .mhs-table tbody tr:last-child td { border-bottom: none; }
    .mhs-table tbody tr:hover td { background: #fdf8f5; }

    .mhs-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 6px;
      border-radius: 7px; background: #f5f0eb; color: #6b5f55;
      font-size: 11px; font-weight: 600; font-family: monospace;
    }

    .mhs-cost-chip {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 3px 9px; border-radius: 20px;
      background: #ecfdf5; color: #0a7a4e;
      font-size: 12px; font-weight: 600;
    }

    .mhs-alert {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 14px;
    }
    .mhs-alert-error   { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .mhs-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    @keyframes mhs-spin { to { transform: rotate(360deg); } }
    .mhs-spinner {
      display: inline-block; width: 17px; height: 17px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: mhs-spin 0.7s linear infinite; flex-shrink: 0;
    }

    .mhs-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 56px 24px; text-align: center;
    }

    @keyframes mhs-slide-down {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mhs-slide-down { animation: mhs-slide-down 0.2s ease; }
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
  wrench:   'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  asset:    'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  desc:     'M4 6h16M4 10h16M4 14h10',
  cost:     'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6',
  filter:   'M3 4h18M7 8h10M11 12h4M13 16h2',
  plus:     'M12 5v14M5 12h14',
  check:    'M20 6L9 17l-5-5',
  clear:    'M18 6L6 18M6 6l12 12',
  warning:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  ok:       'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  chevron:  'M19 9l-7 7-7-7',
  hash:     'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
}

// ─── Field label ──────────────────────────────────────────────────────────────
const FL = ({ children, optional }) => (
  <label className="mhs-label">
    {children}
    {optional && <span className="mhs-label-opt">· optional</span>}
  </label>
)

// ─── Main component ───────────────────────────────────────────────────────────
export default function MaintenanceHistorySection({ token }) {
  const [assets,     setAssets]     = useState([])
  const [records,    setRecords]    = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [message,    setMessage]    = useState('')
  const [formOpen,   setFormOpen]   = useState(false)

  const [assetFilter, setAssetFilter] = useState('')
  const [page,        setPage]        = useState(1)

  const perPage = 10

  const [form, setForm] = useState({
    asset_id:         '',
    maintenance_date: '',
    technician:       '',
    description:      '',
    cost:             '',
  })

  // ── same logic as original ──────────────────────────────────────────────
  const selectedAssetNameById = useMemo(() => {
    const map = new Map()
    for (const asset of assets) map.set(String(asset.id), asset.asset_name)
    return map
  }, [assets])

  useEffect(() => {
    loadAssetsAndHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAssetsAndHistory() {
    setLoading(true); setError('')
    try {
      const [assetsData, historyData] = await Promise.all([
        fetchAssets(token, { page: 1, per_page: 200 }),
        fetchMaintenanceHistory(token, { page: 1, per_page: perPage }),
      ])
      setAssets(assetsData.assets || [])
      setRecords(historyData.records || [])
      setPagination(historyData.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFilter(e) {
    e.preventDefault(); setError(''); setMessage('')
    try {
      const data = await fetchMaintenanceHistory(token, {
        asset_id: assetFilter ? Number(assetFilter) : undefined,
        page: 1, per_page: perPage,
      })
      setPage(1)
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) { setError(err.message) }
  }

  async function resetFilter() {
    setAssetFilter(''); setError('')
    try {
      const data = await fetchMaintenanceHistory(token)
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) { setError(err.message) }
  }

  async function handleAddRecord(e) {
    e.preventDefault(); setError(''); setMessage('')
    if (!form.asset_id || !form.technician.trim()) {
      setError('asset_id and technician are required'); return
    }
    const payload = {
      asset_id:         Number(form.asset_id),
      maintenance_date: form.maintenance_date || undefined,
      technician:       form.technician.trim(),
      description:      form.description.trim() || undefined,
      cost:             form.cost === '' ? undefined : Number(form.cost),
    }
    setSubmitting(true)
    try {
      const data = await addMaintenanceRecord(token, payload)
      setMessage(data.message || 'Maintenance record added')
      setForm({ asset_id: '', maintenance_date: '', technician: '', description: '', cost: '' })
      setFormOpen(false)
      const history = await fetchMaintenanceHistory(token, {
        asset_id: assetFilter ? Number(assetFilter) : undefined,
        page, per_page: perPage,
      })
      setRecords(history.records || [])
      setPagination(history.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    try {
      const data = await fetchMaintenanceHistory(token, {
        asset_id: assetFilter ? Number(assetFilter) : undefined,
        page: nextPage, per_page: perPage,
      })
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) { setError(err.message) }
  }

  const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="mhs-root">

        {/* ── Section heading ── */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
            }}>
              <Ico d={P.wrench} size={18} color="white" sw={2} />
            </div>
            <div>
              <h2 className="mhs-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Maintenance History
              </h2>
              <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
                Log and review all service and repair events
              </p>
            </div>
          </div>
          <button className="mhs-btn-primary" onClick={() => setFormOpen(v => !v)}>
            <Ico d={formOpen ? P.clear : P.plus} size={14} color="white" sw={2.5} />
            {formOpen ? 'Cancel' : 'Log record'}
          </button>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="mhs-alert mhs-alert-error">
            <Ico d={P.warning} size={14} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mhs-alert mhs-alert-success">
            <Ico d={P.ok} size={14} color="#16a34a" />
            <span>{message}</span>
          </div>
        )}

        {/* ── Add record form ── */}
        {formOpen && (
          <div className="mhs-card mhs-slide-down" style={{ marginBottom: 18 }}>
            <div className="mhs-card-header">
              <div>
                <p className="mhs-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
                  New maintenance record
                </p>
                <p style={{ fontSize: 12, color: '#9a928a', fontWeight: 300, marginTop: 2 }}>
                  Fill in the service details below
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

            <form onSubmit={handleAddRecord} style={{ padding: '20px 24px' }}>
              <div className="mhs-form-grid" style={{ marginBottom: 16 }}>

                {/* Asset */}
                <div>
                  <FL>Asset</FL>
                  <div className="mhs-field">
                    <span className="mhs-field-icon"><Ico d={P.asset} size={13} color="#c2bcb3" /></span>
                    <select className="mhs-select" value={form.asset_id} onChange={setField('asset_id')} required>
                      <option value="">Select asset…</option>
                      {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.asset_name} ({a.serial_number})</option>
                      ))}
                    </select>
                    <span className="mhs-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
                  </div>
                </div>

                {/* Technician */}
                <div>
                  <FL>Technician</FL>
                  <div className="mhs-field">
                    <span className="mhs-field-icon"><Ico d={P.user} size={13} color="#c2bcb3" /></span>
                    <input className="mhs-input" type="text" placeholder="Technician name"
                      value={form.technician} onChange={setField('technician')} required />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <FL optional>Maintenance date</FL>
                  <div className="mhs-field">
                    <span className="mhs-field-icon"><Ico d={P.calendar} size={13} color="#c2bcb3" /></span>
                    <input className="mhs-date" type="date"
                      value={form.maintenance_date} onChange={setField('maintenance_date')} />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <FL optional>Cost (₹)</FL>
                  <div className="mhs-field">
                    <span className="mhs-field-icon"><Ico d={P.cost} size={13} color="#c2bcb3" /></span>
                    <input className="mhs-input" type="number" min="0" step="0.01"
                      placeholder="0.00"
                      value={form.cost} onChange={setField('cost')} />
                  </div>
                </div>

                {/* Description — full width */}
                <div className="mhs-form-full">
                  <FL optional>Description</FL>
                  <div className="mhs-field">
                    <textarea className="mhs-textarea" placeholder="Describe the work performed…"
                      value={form.description} onChange={setField('description')} />
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f0ece6' }}>
                <button type="button" className="mhs-btn-ghost" onClick={() => setFormOpen(false)}>
                  <Ico d={P.clear} size={13} />
                  Cancel
                </button>
                <button type="submit" className="mhs-btn-primary" disabled={submitting}>
                  {submitting
                    ? <><span style={{ display:'inline-block',width:13,height:13,border:'2px solid rgba(255,255,255,0.35)',borderTopColor:'white',borderRadius:'50%',animation:'mhs-spin 0.7s linear infinite' }} /> Saving…</>
                    : <><Ico d={P.check} size={13} color="white" sw={2.5} /> Log record</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Main table card ── */}
        <div className="mhs-card">

          {/* Filter bar */}
          <form className="mhs-filter-row" onSubmit={handleFilter}>
            <div className="mhs-field" style={{ flex: 1, minWidth: 200 }}>
              <span className="mhs-field-icon"><Ico d={P.asset} size={13} color="#c2bcb3" /></span>
              <select className="mhs-select" style={{ width: '100%' }}
                value={assetFilter} onChange={e => setAssetFilter(e.target.value)}>
                <option value="">All assets</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_name} ({a.serial_number})</option>
                ))}
              </select>
              <span className="mhs-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
            </div>
            <button type="submit" className="mhs-btn-primary">
              <Ico d={P.filter} size={13} color="white" />
              Filter
            </button>
            <button type="button" className="mhs-btn-ghost" onClick={resetFilter}>
              <Ico d={P.clear} size={13} />
              Reset
            </button>
            {!loading && pagination && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9a928a', whiteSpace: 'nowrap' }}>
                {pagination.total ?? records.length} record{(pagination.total ?? records.length) !== 1 ? 's' : ''} · page {page}
              </span>
            )}
          </form>

          {/* Table header */}
          <div style={{
            padding: '13px 22px 11px',
            borderBottom: '1px solid #f0ece6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p className="mhs-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
              Service records
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '60px 24px', color: '#9a928a', fontSize: 13 }}>
              <span className="mhs-spinner" />
              Loading records…
            </div>

          /* Empty */
          ) : records.length === 0 ? (
            <div className="mhs-empty">
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                border: '1.5px solid #f9d4c3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Ico d={P.wrench} size={26} color="#ff6b35" />
              </div>
              <p className="mhs-display" style={{ fontSize: 16, fontWeight: 700, color: '#1a1612', marginBottom: 5 }}>
                No records found
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 260, fontWeight: 300, lineHeight: 1.6 }}>
                {assetFilter
                  ? 'No maintenance records for this asset. Try resetting the filter.'
                  : <>Hit <strong style={{ color: '#ff6b35' }}>Log record</strong> above to add the first entry.</>}
              </p>
            </div>

          /* Table */
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="mhs-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Asset</th>
                      <th>Date</th>
                      <th>Technician</th>
                      <th>Description</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={record.id}>

                        {/* ID */}
                        <td><span className="mhs-id-chip">{record.id}</span></td>

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
                              {record.asset?.asset_name
                                || selectedAssetNameById.get(String(record.asset_id))
                                || `Asset #${record.asset_id}`}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b5f55', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                            <Ico d={P.calendar} size={12} color="#c2bcb3" />
                            {record.maintenance_date || <span style={{ color: '#c2bcb3' }}>—</span>}
                          </div>
                        </td>

                        {/* Technician */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: 7,
                              background: '#1a1612', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'Syne, sans-serif', fontSize: 9.5, fontWeight: 700, flexShrink: 0,
                            }}>
                              {(record.technician || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{record.technician}</span>
                          </div>
                        </td>

                        {/* Description */}
                        <td style={{ maxWidth: '26ch', color: '#6b5f55', fontSize: 12.5 }}>
                          {record.description
                            ? <span style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{record.description}</span>
                            : <span style={{ color: '#c2bcb3' }}>—</span>}
                        </td>

                        {/* Cost */}
                        <td>
                          {record.cost != null
                            ? <span className="mhs-cost-chip">₹{Number(record.cost).toFixed(2)}</span>
                            : <span style={{ color: '#c2bcb3' }}>—</span>}
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
import { useState } from 'react'

import { ASSET_STATUSES } from '../constants/assetStatuses'
import PaginationControls from './PaginationControls'
import { useAssetInventory } from '../hooks/useAssetInventory'

// ─── Initial form state (unchanged) ──────────────────────────────────────────
const initialFormState = {
  asset_name: '',
  category: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  warranty_expiry: '',
  status: 'Available',
}

// ─── Scoped styles ────────────────────────────────────────────────────────────
const SectionStyles = () => (
  <style>{`
    .ais-root * { box-sizing: border-box; }
    .ais-root { font-family: 'DM Sans', sans-serif; }
    .ais-display { font-family: 'Syne', sans-serif; }

    .ais-card {
      background: #fff;
      border: 1px solid #f0ece6;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 18px;
    }
    .ais-card-header {
      padding: 18px 24px;
      border-bottom: 1px solid #f0ece6;
      background: linear-gradient(135deg,#fff8f5,#fff3ee);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px;
    }

    /* ── Inputs & selects ── */
    .ais-input, .ais-select, .ais-date {
      width: 100%;
      padding: 9px 13px 9px 36px;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 10px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ais-input::placeholder { color: #c2bcb3; }
    .ais-input:focus, .ais-select:focus, .ais-date:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
      background: #fff;
    }
    .ais-select { appearance: none; cursor: pointer; padding-right: 32px; }
    .ais-input-bare {
      padding: 9px 13px;
    }
    .ais-field { position: relative; }
    .ais-field-icon {
      position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3;
    }
    .ais-field-chevron {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      pointer-events: none; display: flex; color: #c2bcb3;
    }

    /* ── Buttons ── */
    .ais-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      background: linear-gradient(135deg,#ff6b35,#e8430f);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em;
      border: none; border-radius: 10px; cursor: pointer;
      box-shadow: 0 3px 10px rgba(255,107,53,0.3);
      transition: all 0.15s; white-space: nowrap;
    }
    .ais-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(255,107,53,0.38); }
    .ais-btn-primary:active { transform: scale(0.98); }
    .ais-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .ais-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; background: transparent;
      color: #6b6560; font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500;
      border: 1.5px solid #ede9e2; border-radius: 10px; cursor: pointer;
      transition: all 0.15s; white-space: nowrap;
    }
    .ais-btn-ghost:hover { border-color: #d0c9bf; background: #faf9f7; color: #1a1612; }

    .ais-btn-edit {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 11px; border-radius: 7px;
      background: #fff8ec; border: 1.5px solid #fde68a;
      color: #92610a; font-family: 'DM Sans', sans-serif;
      font-size: 11.5px; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
    }
    .ais-btn-edit:hover { background: #fffbeb; border-color: #fcd34d; }

    .ais-btn-delete {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 11px; border-radius: 7px;
      background: #fff5f5; border: 1.5px solid #fecaca;
      color: #b91c1c; font-family: 'DM Sans', sans-serif;
      font-size: 11.5px; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
    }
    .ais-btn-delete:hover { background: #fff0f0; border-color: #f87171; }

    /* ── Search bar ── */
    .ais-search-row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      padding: 18px 24px; border-bottom: 1px solid #f0ece6;
      background: #fdfcfb;
    }
    .ais-search-input-wrap { flex: 1; min-width: 200px; position: relative; }
    .ais-search-input {
      width: 100%; padding: 9px 14px 9px 38px;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      background: #faf9f7; border: 1.5px solid #ede9e2;
      border-radius: 10px; color: #1a1612; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ais-search-input::placeholder { color: #c2bcb3; }
    .ais-search-input:focus { border-color: #ff6b35; box-shadow: 0 0 0 3px rgba(255,107,53,0.12); background: #fff; }

    /* ── Status badge ── */
    .ais-status-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .ais-status-dot { width: 5px; height: 5px; border-radius: 50%; }

    /* ── Table ── */
    .ais-table { width: 100%; border-collapse: collapse; }
    .ais-table th {
      padding: 10px 14px; text-align: left;
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #9a928a;
      background: #faf9f7; border-bottom: 1px solid #f0ece6;
      white-space: nowrap;
    }
    .ais-table th:first-child { padding-left: 22px; }
    .ais-table th:last-child { padding-right: 22px; text-align: right; }
    .ais-table td {
      padding: 12px 14px; font-size: 13px; color: #3d332b;
      border-bottom: 1px solid #f8f5f2; vertical-align: middle;
    }
    .ais-table td:first-child { padding-left: 22px; }
    .ais-table td:last-child { padding-right: 22px; }
    .ais-table tbody tr:last-child td { border-bottom: none; }
    .ais-table tbody tr:hover td { background: #fdf8f5; }

    /* ── Form grid ── */
    .ais-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    /* ── Field label ── */
    .ais-label {
      display: block; margin-bottom: 5px;
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em;
      text-transform: uppercase; color: #9a928a;
    }
    .ais-label-opt { font-weight: 400; text-transform: none; letter-spacing: 0; color: #c2bcb3; margin-left: 4px; }

    /* ── Misc ── */
    .ais-id-chip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 6px; border-radius: 7px;
      background: #f5f0eb; color: #6b5f55;
      font-size: 11px; font-weight: 600; font-family: monospace;
    }
    .ais-status-bar {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 11px 14px; border-radius: 12px; font-size: 13px;
    }
    .ais-status-error   { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .ais-status-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    @keyframes ais-spin { to { transform: rotate(360deg); } }
    .ais-spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid #e8e2db; border-top-color: #ff6b35;
      border-radius: 50%; animation: ais-spin 0.7s linear infinite; flex-shrink: 0;
    }

    .ais-empty {
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
  box:      'M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4M12 3v18',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  filter:   'M3 4h18M7 8h10M11 12h4M13 16h2',
  plus:     'M12 5v14M5 12h14',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  cancel:   'M18 6L6 18M6 6l12 12',
  check:    'M20 6L9 17l-5-5',
  warning:  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  ok:       'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  tag:      'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  serial:   'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  chevron:  'M19 9l-7 7-7-7',
  clear:    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
}

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  Available:    { bg: '#ecfdf5', color: '#0a7a4e', dot: '#27ae60' },
  Assigned:     { bg: '#fff8ec', color: '#b7640a', dot: '#f39c12' },
  'In Repair':  { bg: '#fef3c7', color: '#92610a', dot: '#d97706' },
  Retired:      { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' },
  Lost:         { bg: '#fff5f5', color: '#c0392b', dot: '#e74c3c' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f5f0eb', color: '#6b5f55', dot: '#9a928a' }
  return (
    <span className="ais-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="ais-status-dot" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

// ─── Status message ───────────────────────────────────────────────────────────
const StatusBar = ({ type, text }) => {
  if (!text) return null
  const isErr = type === 'error'
  return (
    <div className={`ais-status-bar ${isErr ? 'ais-status-error' : 'ais-status-success'}`}>
      <Ico d={isErr ? P.warning : P.ok} size={14} color={isErr ? '#dc2626' : '#16a34a'} />
      <span>{text}</span>
    </div>
  )
}

// ─── Field label ──────────────────────────────────────────────────────────────
const FL = ({ children, optional }) => (
  <label className="ais-label">
    {children}
    {optional && <span className="ais-label-opt">· optional</span>}
  </label>
)

// ─── Main component ───────────────────────────────────────────────────────────
function AssetInventorySection({ token }) {
  const [searchText,   setSearchText]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [formData,     setFormData]     = useState(initialFormState)
  const [editingId,    setEditingId]    = useState(null)
  const [error,        setError]        = useState('')
  const [message,      setMessage]      = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [formOpen,     setFormOpen]     = useState(false)

  const { assets, pagination, loading, loadAssets, createAsset, editAsset, removeAsset } =
    useAssetInventory(token, true)

  const perPage = 10
  const currentFilters = () => ({ q: searchText, status: statusFilter, page, per_page: perPage })

  // ── Handlers — same logic as original ──────────────────────────────────
  const handleSearch = async (event) => {
    event.preventDefault()
    setPage(1); setError('')
    try {
      await loadAssets({ q: searchText, status: statusFilter, page: 1, per_page: perPage })
    } catch (err) { setError(err.message) }
  }

  const handleClearFilters = async () => {
    setSearchText(''); setStatusFilter(''); setPage(1); setError('')
    await loadAssets({ q: '', status: '', page: 1, per_page: perPage })
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setError(''); setMessage(''); setSubmitting(true)
    try {
      if (editingId) {
        const data = await editAsset(editingId, formData)
        setMessage(`Asset updated: ${data.asset.asset_name}`)
      } else {
        const data = await createAsset(formData)
        setMessage(`Asset added: ${data.asset.asset_name}`)
      }
      setFormData(initialFormState); setEditingId(null); setFormOpen(false)
      await loadAssets(currentFilters())
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (asset) => {
    setEditingId(asset.id)
    setFormData({
      asset_name:      asset.asset_name      || '',
      category:        asset.category        || '',
      brand:           asset.brand           || '',
      model:           asset.model           || '',
      serial_number:   asset.serial_number   || '',
      purchase_date:   asset.purchase_date   || '',
      warranty_expiry: asset.warranty_expiry || '',
      status:          asset.status          || 'Available',
    })
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return
    setError(''); setMessage('')
    try {
      await removeAsset(assetId)
      setMessage('Asset deleted successfully')
    } catch (err) { setError(err.message) }
  }

  const handleCancelEdit = () => {
    setEditingId(null); setFormData(initialFormState); setFormOpen(false)
  }

  const handlePageChange = async (nextPage) => {
    setError(''); setPage(nextPage)
    await loadAssets({ q: searchText, status: statusFilter, page: nextPage, per_page: perPage })
  }

  const setField = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SectionStyles />
      <div className="ais-root">

        {/* ── Section heading ── */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,#ff6b35,#e8430f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
            }}>
              <Ico d={P.box} size={18} color="white" sw={2} />
            </div>
            <div>
              <h2 className="ais-display" style={{ fontSize: 20, fontWeight: 800, color: '#1a1612', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Asset Inventory
              </h2>
              <p style={{ fontSize: 13, color: '#8a837a', fontWeight: 300, marginTop: 2 }}>
                {assets.length > 0 ? `${pagination?.total ?? assets.length} assets tracked` : 'Add and manage all company assets'}
              </p>
            </div>
          </div>

          <button className="ais-btn-primary" onClick={() => { setFormOpen(v => !v); if (editingId) handleCancelEdit() }}>
            <Ico d={formOpen && !editingId ? P.cancel : P.plus} size={14} color="white" sw={2.5} />
            {formOpen && !editingId ? 'Cancel' : 'Add asset'}
          </button>
        </div>

        {/* ── Add / Edit form ── */}
        {formOpen && (
          <div className="ais-card" style={{ marginBottom: 18 }}>
            <div className="ais-card-header">
              <div>
                <p className="ais-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
                  {editingId ? 'Edit asset' : 'New asset'}
                </p>
                <p style={{ fontSize: 12, color: '#9a928a', fontWeight: 300, marginTop: 2 }}>
                  {editingId ? 'Update the fields below and save' : 'Fill in the details to register a new asset'}
                </p>
              </div>
              {editingId && (
                <span style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(255,107,53,0.1)', color: '#e8430f',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Editing #{editingId}
                </span>
              )}
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '20px 24px' }}>
              <div className="ais-form-grid" style={{ marginBottom: 16 }}>

                <div>
                  <FL>Asset name</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.box} size={13} color="#c2bcb3" /></span>
                    <input className="ais-input" type="text" placeholder="MacBook Pro 14"
                      value={formData.asset_name} onChange={setField('asset_name')} required />
                  </div>
                </div>

                <div>
                  <FL>Category</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.tag} size={13} color="#c2bcb3" /></span>
                    <input className="ais-input" type="text" placeholder="Laptop, Monitor…"
                      value={formData.category} onChange={setField('category')} required />
                  </div>
                </div>

                <div>
                  <FL optional>Brand</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.tag} size={13} color="#c2bcb3" /></span>
                    <input className="ais-input" type="text" placeholder="Apple, Dell…"
                      value={formData.brand} onChange={setField('brand')} />
                  </div>
                </div>

                <div>
                  <FL optional>Model</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.tag} size={13} color="#c2bcb3" /></span>
                    <input className="ais-input" type="text" placeholder="MK183LL/A"
                      value={formData.model} onChange={setField('model')} />
                  </div>
                </div>

                <div>
                  <FL>Serial number</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.serial} size={13} color="#c2bcb3" /></span>
                    <input className="ais-input" type="text" placeholder="SN-0001234"
                      value={formData.serial_number} onChange={setField('serial_number')} required />
                  </div>
                </div>

                <div>
                  <FL optional>Purchase date</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.calendar} size={13} color="#c2bcb3" /></span>
                    <input className="ais-date" type="date"
                      value={formData.purchase_date} onChange={setField('purchase_date')} />
                  </div>
                </div>

                <div>
                  <FL optional>Warranty expiry</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.calendar} size={13} color="#c2bcb3" /></span>
                    <input className="ais-date" type="date"
                      value={formData.warranty_expiry} onChange={setField('warranty_expiry')} />
                  </div>
                </div>

                <div>
                  <FL>Status</FL>
                  <div className="ais-field">
                    <span className="ais-field-icon"><Ico d={P.filter} size={13} color="#c2bcb3" /></span>
                    <select className="ais-select" value={formData.status} onChange={setField('status')}>
                      {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="ais-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f0ece6' }}>
                <button type="button" className="ais-btn-ghost" onClick={handleCancelEdit}>
                  <Ico d={P.cancel} size={13} color="currentColor" />
                  {editingId ? 'Cancel edit' : 'Cancel'}
                </button>
                <button type="submit" className="ais-btn-primary" disabled={submitting}>
                  {submitting
                    ? <><span style={{ display:'inline-block',width:13,height:13,border:'2px solid rgba(255,255,255,0.35)',borderTopColor:'white',borderRadius:'50%',animation:'ais-spin 0.7s linear infinite' }} /> Saving…</>
                    : <><Ico d={editingId ? P.check : P.plus} size={13} color="white" sw={2.5} /> {editingId ? 'Update asset' : 'Add asset'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Status messages ── */}
        {(error || message) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <StatusBar type="error"   text={error}   />
            <StatusBar type="success" text={message} />
          </div>
        )}

        {/* ── Search & filter bar ── */}
        <div className="ais-card">
          <form className="ais-search-row" onSubmit={handleSearch}>
            <div className="ais-search-input-wrap">
              <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', display:'flex', color:'#c2bcb3', pointerEvents:'none' }}>
                <Ico d={P.search} size={14} color="#c2bcb3" />
              </span>
              <input className="ais-search-input" type="text"
                placeholder="Search name, category, brand, model, serial…"
                value={searchText} onChange={e => setSearchText(e.target.value)} />
            </div>

            <div className="ais-field" style={{ minWidth: 150 }}>
              <span className="ais-field-icon"><Ico d={P.filter} size={13} color="#c2bcb3" /></span>
              <select className="ais-select" style={{ minWidth: 150 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="ais-field-chevron"><Ico d={P.chevron} size={12} color="#c2bcb3" /></span>
            </div>

            <button type="submit" className="ais-btn-primary" style={{ padding: '9px 16px' }}>
              <Ico d={P.search} size={13} color="white" />
              Search
            </button>
            <button type="button" className="ais-btn-ghost" onClick={handleClearFilters}>
              <Ico d={P.clear} size={13} color="currentColor" />
              Clear
            </button>
          </form>

          {/* ── Table header ── */}
          <div style={{
            padding: '14px 22px 12px',
            borderBottom: '1px solid #f0ece6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p className="ais-display" style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', letterSpacing: '-0.01em' }}>
              All assets
            </p>
            {pagination && !loading && (
              <p style={{ fontSize: 11.5, color: '#9a928a', fontWeight: 300 }}>
                {pagination.total ?? assets.length} total · page {page} of {Math.ceil((pagination.total ?? assets.length) / perPage) || 1}
              </p>
            )}
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'60px 24px', color:'#9a928a', fontSize:13 }}>
              <span className="ais-spinner" />
              Loading assets…
            </div>

          /* ── Empty ── */
          ) : assets.length === 0 ? (
            <div className="ais-empty">
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                border: '1.5px solid #f9d4c3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Ico d={P.box} size={26} color="#ff6b35" />
              </div>
              <p className="ais-display" style={{ fontSize: 16, fontWeight: 700, color: '#1a1612', marginBottom: 5 }}>
                No assets found
              </p>
              <p style={{ fontSize: 13, color: '#9a928a', maxWidth: 260, fontWeight: 300, lineHeight: 1.6 }}>
                {searchText || statusFilter
                  ? 'Try adjusting your search or clearing the filters.'
                  : <>Hit <strong style={{ color:'#ff6b35' }}>Add asset</strong> above to register your first asset.</>}
              </p>
            </div>

          /* ── Table ── */
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="ais-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Asset name</th>
                      <th>Category</th>
                      <th>Brand / Model</th>
                      <th>Serial no.</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(asset => (
                      <tr key={asset.id}>
                        <td><span className="ais-id-chip">{asset.id}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 9,
                              background: 'linear-gradient(135deg,#fff3ee,#ffe8dc)',
                              border: '1px solid #f9d4c3',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Ico d={P.box} size={13} color="#ff6b35" />
                            </div>
                            <span style={{ fontWeight: 500, color: '#1a1612' }}>{asset.asset_name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#5a4d45' }}>{asset.category}</td>
                        <td>
                          <span style={{ color: '#3d332b', fontWeight: 500 }}>{asset.brand || '—'}</span>
                          {asset.model && <span style={{ color: '#9a928a', fontSize: 12, marginLeft: 4 }}>{asset.model}</span>}
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600,
                            background: '#f5f0eb', color: '#6b5f55',
                            padding: '2px 7px', borderRadius: 6,
                          }}>
                            {asset.serial_number}
                          </span>
                        </td>
                        <td><StatusBadge status={asset.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="ais-btn-edit" onClick={() => handleEditClick(asset)}>
                              <Ico d={P.edit} size={11} color="#92610a" />
                              Edit
                            </button>
                            <button className="ais-btn-delete" onClick={() => handleDeleteClick(asset.id)}>
                              <Ico d={P.trash} size={11} color="#b91c1c" />
                              Delete
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

export default AssetInventorySection
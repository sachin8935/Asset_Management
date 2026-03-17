import { useEffect, useMemo, useState } from 'react'

import { fetchAssets } from '../services/assetService'
import PaginationControls from './PaginationControls'
import {
  addMaintenanceRecord,
  fetchMaintenanceHistory,
} from '../services/maintenanceService'

export default function MaintenanceHistorySection({ token }) {
  const [assets, setAssets] = useState([])
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [assetFilter, setAssetFilter] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 10

  const [form, setForm] = useState({
    asset_id: '',
    maintenance_date: '',
    technician: '',
    description: '',
    cost: '',
  })

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
    setLoading(true)
    setError('')

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
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const data = await fetchMaintenanceHistory(token, {
        asset_id: assetFilter ? Number(assetFilter) : undefined,
        page: 1,
        per_page: perPage,
      })
      setPage(1)
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function resetFilter() {
    setAssetFilter('')
    setError('')
    try {
      const data = await fetchMaintenanceHistory(token)
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAddRecord(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.asset_id || !form.technician.trim()) {
      setError('asset_id and technician are required')
      return
    }

    const payload = {
      asset_id: Number(form.asset_id),
      maintenance_date: form.maintenance_date || undefined,
      technician: form.technician.trim(),
      description: form.description.trim() || undefined,
      cost: form.cost === '' ? undefined : Number(form.cost),
    }

    setSubmitting(true)
    try {
      const data = await addMaintenanceRecord(token, payload)
      setMessage(data.message || 'Maintenance record added')
      setForm({
        asset_id: '',
        maintenance_date: '',
        technician: '',
        description: '',
        cost: '',
      })
      const history = await fetchMaintenanceHistory(token, {
        asset_id: assetFilter ? Number(assetFilter) : undefined,
        page,
        per_page: perPage,
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
        page: nextPage,
        per_page: perPage,
      })
      setRecords(data.records || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Maintenance History</h2>

      <form className='maintenance-form' onSubmit={handleAddRecord}>
        <div>
          <label>Asset</label>
          <select
            value={form.asset_id}
            onChange={(e) => setForm((prev) => ({ ...prev, asset_id: e.target.value }))}
            required
          >
            <option value=''>Select asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.asset_name} ({asset.serial_number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Technician</label>
          <input
            value={form.technician}
            onChange={(e) => setForm((prev) => ({ ...prev, technician: e.target.value }))}
            placeholder='Technician name'
            required
          />
        </div>

        <div>
          <label>Maintenance Date</label>
          <input
            type='date'
            value={form.maintenance_date}
            onChange={(e) => setForm((prev) => ({ ...prev, maintenance_date: e.target.value }))}
          />
        </div>

        <div>
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder='Work performed'
          />
        </div>

        <div>
          <label>Cost</label>
          <input
            type='number'
            min='0'
            step='0.01'
            value={form.cost}
            onChange={(e) => setForm((prev) => ({ ...prev, cost: e.target.value }))}
            placeholder='0.00'
          />
        </div>

        <button type='submit' disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Record'}
        </button>
      </form>

      <form className='search-row' onSubmit={handleFilter}>
        <select value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)}>
          <option value=''>All assets</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.asset_name} ({asset.serial_number})
            </option>
          ))}
        </select>
        <div></div>
        <button type='submit'>Filter History</button>
        <button
          type='button'
          onClick={resetFilter}
        >
          Reset
        </button>
      </form>

      {error ? <p className='error'>{error}</p> : null}
      {message ? <p className='message'>{message}</p> : null}

      {loading ? <p>Loading...</p> : null}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Asset</th>
            <th>Date</th>
            <th>Technician</th>
            <th>Description</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={6}>No maintenance records found.</td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>
                  {record.asset?.asset_name || selectedAssetNameById.get(String(record.asset_id)) || `Asset #${record.asset_id}`}
                </td>
                <td>{record.maintenance_date || '-'}</td>
                <td>{record.technician}</td>
                <td>{record.description || '-'}</td>
                <td>{record.cost != null ? Number(record.cost).toFixed(2) : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
    </div>
  )
}

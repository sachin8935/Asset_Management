import { useState } from 'react'

import { ASSET_STATUSES } from '../constants/assetStatuses'
import PaginationControls from './PaginationControls'
import { useAssetInventory } from '../hooks/useAssetInventory'

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

function AssetInventorySection({ token }) {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [formData, setFormData] = useState(initialFormState)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { assets, pagination, loading, loadAssets, createAsset, editAsset, removeAsset } = useAssetInventory(
    token,
    true,
  )

  const perPage = 10

  const currentFilters = () => ({ q: searchText, status: statusFilter, page, per_page: perPage })

  const handleSearch = async (event) => {
    event.preventDefault()
    setPage(1)
    setError('')
    try {
      await loadAssets({ q: searchText, status: statusFilter, page: 1, per_page: perPage })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClearFilters = async () => {
    setSearchText('')
    setStatusFilter('')
    setPage(1)
    setError('')
    await loadAssets({ q: '', status: '', page: 1, per_page: perPage })
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (editingId) {
        const data = await editAsset(editingId, formData)
        setMessage(`Asset updated: ${data.asset.asset_name}`)
      } else {
        const data = await createAsset(formData)
        setMessage(`Asset added: ${data.asset.asset_name}`)
      }

      setFormData(initialFormState)
      setEditingId(null)
      await loadAssets(currentFilters())
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditClick = (asset) => {
    setEditingId(asset.id)
    setFormData({
      asset_name: asset.asset_name || '',
      category: asset.category || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      warranty_expiry: asset.warranty_expiry || '',
      status: asset.status || 'Available',
    })
  }

  const handleDeleteClick = async (assetId) => {
    const confirmed = window.confirm('Are you sure you want to delete this asset?')
    if (!confirmed) return

    setError('')
    setMessage('')
    try {
      await removeAsset(assetId)
      setMessage('Asset deleted successfully')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(initialFormState)
  }

  const handlePageChange = async (nextPage) => {
    setError('')
    setPage(nextPage)
    await loadAssets({ q: searchText, status: statusFilter, page: nextPage, per_page: perPage })
  }

  return (
    <section className='card'>
      <h2>Asset Inventory</h2>

      <form className='search-row' onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Search by name/category/brand/model/serial'
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value=''>All Statuses</option>
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button type='submit'>Search / Filter</button>
        <button type='button' onClick={handleClearFilters}>
          Clear
        </button>
      </form>

      <form className='asset-form-grid' onSubmit={handleFormSubmit}>
        <input
          type='text'
          placeholder='Asset Name'
          value={formData.asset_name}
          onChange={(event) => setFormData((prev) => ({ ...prev, asset_name: event.target.value }))}
          required
        />
        <input
          type='text'
          placeholder='Category'
          value={formData.category}
          onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
          required
        />
        <input
          type='text'
          placeholder='Brand'
          value={formData.brand}
          onChange={(event) => setFormData((prev) => ({ ...prev, brand: event.target.value }))}
        />
        <input
          type='text'
          placeholder='Model'
          value={formData.model}
          onChange={(event) => setFormData((prev) => ({ ...prev, model: event.target.value }))}
        />
        <input
          type='text'
          placeholder='Serial Number'
          value={formData.serial_number}
          onChange={(event) => setFormData((prev) => ({ ...prev, serial_number: event.target.value }))}
          required
        />
        <input
          type='date'
          value={formData.purchase_date}
          onChange={(event) => setFormData((prev) => ({ ...prev, purchase_date: event.target.value }))}
        />
        <input
          type='date'
          value={formData.warranty_expiry}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, warranty_expiry: event.target.value }))
          }
        />
        <select
          value={formData.status}
          onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
        >
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button type='submit'>{editingId ? 'Update Asset' : 'Add Asset'}</button>
        {editingId ? (
          <button type='button' onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        ) : null}
      </form>

      {loading ? (
        <p>Loading assets...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.id}</td>
                  <td>{asset.asset_name}</td>
                  <td>{asset.category}</td>
                  <td>{asset.brand || '-'}</td>
                  <td>{asset.model || '-'}</td>
                  <td>{asset.serial_number}</td>
                  <td>{asset.status}</td>
                  <td>
                    <button onClick={() => handleEditClick(asset)}>Edit</button>
                    <button onClick={() => handleDeleteClick(asset.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {error ? <p className='error'>{error}</p> : null}
      {message ? <p className='message'>{message}</p> : null}
    </section>
  )
}

export default AssetInventorySection
import { useEffect, useState } from 'react'

import {
  addAsset,
  deleteAsset,
  fetchAssets,
  updateAsset,
} from '../services/assetService'

export function useAssetInventory(token, enabled) {
  const [assets, setAssets] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadAssets = async (filters = {}) => {
    if (!token || !enabled) return

    setLoading(true)
    try {
      const data = await fetchAssets(token, filters)
      setAssets(data.assets || [])
      setPagination(data.pagination || null)
      return data.assets || []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [token, enabled])

  const createAsset = async (payload) => {
    const data = await addAsset(token, payload)
    setAssets((prev) => [...prev, data.asset])
    return data
  }

  const editAsset = async (assetId, payload) => {
    const data = await updateAsset(token, assetId, payload)
    setAssets((prev) =>
      prev.map((asset) => (asset.id === assetId ? data.asset : asset)),
    )
    return data
  }

  const removeAsset = async (assetId) => {
    const data = await deleteAsset(token, assetId)
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
    return data
  }

  return {
    assets,
    pagination,
    loading,
    loadAssets,
    createAsset,
    editAsset,
    removeAsset,
  }
}
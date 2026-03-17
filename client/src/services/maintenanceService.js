import { apiRequest, buildAuthHeaders } from './apiClient'

export function addMaintenanceRecord(token, payload) {
  return apiRequest('/api/maintenance', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function fetchMaintenanceHistory(token, { asset_id, page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams()
  if (asset_id) params.set('asset_id', asset_id)
  params.set('page', String(page))
  params.set('per_page', String(per_page))

  const query = params.toString()
  return apiRequest(`/api/maintenance${query ? `?${query}` : ''}`, {
    headers: buildAuthHeaders(token),
  })
}

export function fetchMaintenanceHistoryByAsset(token, assetId, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/maintenance/asset/${assetId}?${params.toString()}`, {
    headers: buildAuthHeaders(token),
  })
}

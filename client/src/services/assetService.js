import { apiRequest, buildAuthHeaders } from './apiClient'

export function fetchAssets(token, { q = '', status = '', page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('per_page', String(per_page))

  const queryString = params.toString()
  return apiRequest(`/api/assets${queryString ? `?${queryString}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function addAsset(token, payload) {
  return apiRequest('/api/assets', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function updateAsset(token, assetId, payload) {
  return apiRequest(`/api/assets/${assetId}`, {
    method: 'PUT',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function deleteAsset(token, assetId) {
  return apiRequest(`/api/assets/${assetId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
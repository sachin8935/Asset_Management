import { apiRequest, buildAuthHeaders } from './apiClient'

export function fetchAllUsers(token, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/admin/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function updateUserRole(token, userId, role) {
  return apiRequest(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ role }),
  })
}

export function createUserByAdmin(token, payload) {
  return apiRequest('/api/admin/users', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}
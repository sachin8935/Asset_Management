import { apiRequest, buildAuthHeaders } from './apiClient'

export function fetchDashboardStats(token) {
  return apiRequest('/api/dashboard/stats', {
    headers: buildAuthHeaders(token),
  })
}

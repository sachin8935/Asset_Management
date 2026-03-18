import { apiRequest, buildAuthHeaders } from './apiClient'

export function fetchAllAssignments(token, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/assignments?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function fetchAssignableEmployees(token, { page = 1, per_page = 200 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/assignments/employees?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function assignAssetToEmployee(token, payload) {
  return apiRequest('/api/assignments', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function returnAssignedAsset(token, assignmentId, payload = {}) {
  return apiRequest(`/api/assignments/${assignmentId}/return`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function fetchEmployeeAssignments(token, employeeId, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/assignments/employee/${employeeId}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function fetchMyAssignments(token, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/assignments/me?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
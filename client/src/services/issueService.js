import { apiRequest, buildAuthHeaders } from './apiClient'

/**
 * Report a new issue (any authenticated user).
 * @param {string} token
 * @param {{ asset_id: number, issue_description: string }} payload
 */
export async function reportIssue(token, payload) {
  return apiRequest('/api/issues', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  })
}

/**
 * Fetch all issues with optional filters (Admin / IT Manager).
 * @param {string} token
 * @param {{ asset_id?: number, employee_id?: number, status?: string }} filters
 */
export async function fetchAllIssues(token, filters = {}) {
  const params = new URLSearchParams()
  if (filters.asset_id) params.set('asset_id', filters.asset_id)
  if (filters.employee_id) params.set('employee_id', filters.employee_id)
  if (filters.status) params.set('status', filters.status)
  params.set('page', String(filters.page || 1))
  params.set('per_page', String(filters.per_page || 10))

  const qs = params.toString()
  return apiRequest(`/api/issues${qs ? `?${qs}` : ''}`, {
    headers: buildAuthHeaders(token),
  })
}

/**
 * Fetch issues for a specific asset (Admin / IT Manager).
 */
export async function fetchIssuesByAsset(token, assetId) {
  return apiRequest(`/api/issues/asset/${assetId}`, {
    headers: buildAuthHeaders(token),
  })
}

/**
 * Fetch issues reported by a specific employee (Admin / IT Manager).
 */
export async function fetchIssuesByEmployee(token, employeeId) {
  return apiRequest(`/api/issues/employee/${employeeId}`, {
    headers: buildAuthHeaders(token),
  })
}

/**
 * Fetch the current user's own issues.
 */
export async function fetchMyIssues(token, { page = 1, per_page = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  })

  return apiRequest(`/api/issues/me?${params.toString()}`, {
    headers: buildAuthHeaders(token),
  })
}

/**
 * Update an issue's status (Admin / IT Manager).
 * @param {string} token
 * @param {number} issueId
 * @param {string} status  One of: 'Open', 'In Progress', 'Resolved', 'Closed'
 */
export async function updateIssueStatus(token, issueId, status) {
  return apiRequest(`/api/issues/${issueId}/status`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ status }),
  })
}

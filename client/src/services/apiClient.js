const DEFAULT_TIMEOUT_MS = 15000
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  if (!API_BASE_URL) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  let response
  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
      credentials: 'same-origin',
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw new Error('Network error. Please check your connection.')
  } finally {
    clearTimeout(timeout)
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json().catch(() => ({})) : {}

  if (!response.ok) {
    const message = data.error || data.message || `Request failed (${response.status})`
    throw new Error(message)
  }

  return data
}

export function buildAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}
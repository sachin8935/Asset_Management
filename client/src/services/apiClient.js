const DEFAULT_TIMEOUT_MS = 15000
const FALLBACK_PROD_API_BASE_URL = 'https://asset-management-utgk.onrender.com'

function resolveApiBaseUrl() {
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
  if (envBaseUrl) return envBaseUrl

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
    return FALLBACK_PROD_API_BASE_URL
  }

  return ''
}

const API_BASE_URL = resolveApiBaseUrl()

function normalizeErrorMessage(errorPayload, responseStatus) {
  if (typeof errorPayload === 'string' && errorPayload.trim()) {
    return errorPayload
  }

  if (errorPayload && typeof errorPayload === 'object') {
    if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
      return errorPayload.message
    }

    if (typeof errorPayload.error === 'string' && errorPayload.error.trim()) {
      return errorPayload.error
    }
  }

  return `Request failed (${responseStatus})`
}

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
    const message = normalizeErrorMessage(data?.error || data?.message || data, response.status)
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
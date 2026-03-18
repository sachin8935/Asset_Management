import { apiRequest } from './apiClient'

const LOGIN_RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504])

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function loginUser(payload) {
  let attempt = 0
  let lastError = null

  while (attempt < 2) {
    try {
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      lastError = error
      const isRetryableStatus = LOGIN_RETRYABLE_STATUS_CODES.has(error?.status)
      const isGenericServerError = /internal server error/i.test(error?.message || '')

      if (!(isRetryableStatus || isGenericServerError) || attempt === 1) {
        throw error
      }

      await wait(1200)
      attempt += 1
    }
  }

  throw lastError || new Error('Unable to log in. Please try again.')
}

export function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
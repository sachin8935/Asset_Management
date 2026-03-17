import { useCallback, useState } from 'react'

import {
  fetchAllIssues,
  fetchMyIssues,
  reportIssue,
  updateIssueStatus,
} from '../services/issueService'

/**
 * Hook for IT Manager / Admin: load all issues, filter, and update status.
 */
export function useIssueManagement(token) {
  const [issues, setIssues] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadIssues = useCallback(
    async (filters = {}) => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchAllIssues(token, filters)
        setIssues(data.issues)
        setPagination(data.pagination || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  const changeStatus = useCallback(
    async (issueId, status) => {
      setError('')
      setMessage('')
      try {
        const data = await updateIssueStatus(token, issueId, status)
        setMessage(data.message)
        setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? data.issue : i)),
        )
      } catch (err) {
        setError(err.message)
      }
    },
    [token],
  )

  return { issues, pagination, loading, error, message, loadIssues, changeStatus }
}

/**
 * Hook for any authenticated user: report issues and view their own issues.
 */
export function useMyIssues(token) {
  const [myIssues, setMyIssues] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadMyIssues = useCallback(async (paginationParams = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyIssues(token, paginationParams)
      setMyIssues(data.issues)
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  const submitIssue = useCallback(
    async (payload) => {
      setError('')
      setMessage('')
      try {
        const data = await reportIssue(token, payload)
        setMessage(data.message)
        setMyIssues((prev) => [data.issue, ...prev])
        return data.issue
      } catch (err) {
        setError(err.message)
        throw err
      }
    },
    [token],
  )

  return { myIssues, pagination, loading, error, message, loadMyIssues, submitIssue }
}

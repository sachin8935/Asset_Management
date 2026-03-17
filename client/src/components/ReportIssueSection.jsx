import { useEffect, useState } from 'react'

import { fetchMyAssignments } from '../services/assignmentService'
import PaginationControls from './PaginationControls'
import { useMyIssues } from '../hooks/useIssues'

const STATUS_BADGE = {
  Open: '#e53e3e',
  'In Progress': '#d97706',
  Resolved: '#38a169',
  Closed: '#718096',
}

export default function ReportIssueSection({ token }) {
  const { myIssues, pagination, loading, error, message, loadMyIssues, submitIssue } =
    useMyIssues(token)

  const [myAssets, setMyAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)

  // form state
  const [assetId, setAssetId] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 10

  useEffect(() => {
    loadMyIssues({ page: 1, per_page: perPage })
    loadMyAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadMyAssets() {
    setAssetsLoading(true)
    try {
      const data = await fetchMyAssignments(token, { page: 1, per_page: 200 })
      // Only active (not yet returned) assignments
      const active = data.assignments.filter((a) => !a.return_date)
      setMyAssets(active)
    } catch {
      // silently fail — user may have no assigned assets
    } finally {
      setAssetsLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormMessage('')

    if (!assetId) {
      setFormError('Please select an asset.')
      return
    }
    if (!description.trim()) {
      setFormError('Please describe the issue.')
      return
    }

    setSubmitting(true)
    try {
      await submitIssue({ asset_id: Number(assetId), issue_description: description.trim() })
      setFormMessage(message || 'Issue reported successfully.')
      setAssetId('')
      setDescription('')
      await loadMyIssues({ page, per_page: perPage })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadMyIssues({ page: nextPage, per_page: perPage })
  }

  return (
    <div>
      <h2>Report an Issue</h2>

      {/* ── Report Form ─────────────────────────────────────── */}
      <form className='issue-form' onSubmit={handleSubmit}>
        <div>
          <label>Asset</label>
          {assetsLoading ? (
            <p style={{ fontSize: '0.875rem', color: '#718096' }}>Loading your assets…</p>
          ) : myAssets.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#718096' }}>
              You have no currently assigned assets.
            </p>
          ) : (
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} required>
              <option value=''>— select asset —</option>
              {myAssets.map((a) => (
                <option key={a.id} value={a.asset?.id ?? a.asset_id}>
                  {a.asset?.asset_name ?? `Asset #${a.asset_id}`} ({a.asset?.serial_number ?? ''})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label>Description</label>
          <textarea
            rows={3}
            placeholder='Describe the issue in detail…'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ resize: 'vertical', width: '100%' }}
          />
        </div>

        <button type='submit' disabled={submitting || myAssets.length === 0}>
          {submitting ? 'Submitting…' : 'Submit Issue'}
        </button>
      </form>

      {formError && <p className='error'>{formError}</p>}
      {formMessage && <p className='message'>{formMessage}</p>}
      {error && <p className='error'>{error}</p>}

      {/* ── My Reported Issues ──────────────────────────────── */}
      <h2 style={{ marginTop: '2rem' }}>My Reported Issues</h2>

      {loading ? (
        <p>Loading…</p>
      ) : myIssues.length === 0 ? (
        <p style={{ color: '#718096' }}>You haven't reported any issues yet.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Asset</th>
                <th>Description</th>
                <th>Status</th>
                <th>Reported</th>
              </tr>
            </thead>
            <tbody>
              {myIssues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>{issue.asset?.asset_name ?? `#${issue.asset_id}`}</td>
                  <td style={{ maxWidth: '30ch', wordBreak: 'break-word' }}>
                    {issue.issue_description}
                  </td>
                  <td>
                    <span
                      style={{
                        background: STATUS_BADGE[issue.status] ?? '#718096',
                        color: '#fff',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td>{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'

import PaginationControls from './PaginationControls'
import { useIssueManagement } from '../hooks/useIssues'

const ISSUE_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

const STATUS_BADGE = {
  Open: '#e53e3e',
  'In Progress': '#d97706',
  Resolved: '#38a169',
  Closed: '#718096',
}

export default function IssueManagementSection({ token }) {
  const { issues, pagination, loading, error, message, loadIssues, changeStatus } =
    useIssueManagement(token)

  // filter state
  const [statusFilter, setStatusFilter] = useState('')
  const [assetIdFilter, setAssetIdFilter] = useState('')
  const [employeeIdFilter, setEmployeeIdFilter] = useState('')

  // pending status changes: { [issueId]: newStatus }
  const [statusDraft, setStatusDraft] = useState({})
  const [page, setPage] = useState(1)

  const perPage = 10

  useEffect(() => {
    loadIssues({ page: 1, per_page: perPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildFilters() {
    const f = {}
    if (statusFilter) f.status = statusFilter
    if (assetIdFilter) f.asset_id = Number(assetIdFilter)
    if (employeeIdFilter) f.employee_id = Number(employeeIdFilter)
    f.page = page
    f.per_page = perPage
    return f
  }

  function handleApplyFilters(e) {
    e.preventDefault()
    setPage(1)
    loadIssues({ ...buildFilters(), page: 1, per_page: perPage })
  }

  function handleClearFilters() {
    setStatusFilter('')
    setAssetIdFilter('')
    setEmployeeIdFilter('')
    setPage(1)
    loadIssues({ page: 1, per_page: perPage })
  }

  function handleStatusDraftChange(issueId, value) {
    setStatusDraft((prev) => ({ ...prev, [issueId]: value }))
  }

  async function handleStatusUpdate(issueId) {
    const newStatus = statusDraft[issueId]
    if (!newStatus) return
    await changeStatus(issueId, newStatus)
    setStatusDraft((prev) => {
      const next = { ...prev }
      delete next[issueId]
      return next
    })
  }

  function handlePageChange(nextPage) {
    setPage(nextPage)
    loadIssues({
      status: statusFilter || undefined,
      asset_id: assetIdFilter ? Number(assetIdFilter) : undefined,
      employee_id: employeeIdFilter ? Number(employeeIdFilter) : undefined,
      page: nextPage,
      per_page: perPage,
    })
  }

  return (
    <div>
      <h2>Issue Management</h2>

      {/* ── Filters ──────────────────────────────────────────── */}
      <form className='search-row' onSubmit={handleApplyFilters} style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        >
          <option value=''>All Statuses</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type='number'
          placeholder='Asset ID'
          value={assetIdFilter}
          onChange={(e) => setAssetIdFilter(e.target.value)}
          style={{ width: '100px' }}
          min={1}
        />

        <input
          type='number'
          placeholder='Employee ID'
          value={employeeIdFilter}
          onChange={(e) => setEmployeeIdFilter(e.target.value)}
          style={{ width: '110px' }}
          min={1}
        />

        <button type='submit'>Apply</button>
        <button type='button' onClick={handleClearFilters}>
          Clear
        </button>
      </form>

      {error && <p className='error'>{error}</p>}
      {message && <p className='message'>{message}</p>}

      {/* ── Issues Table ─────────────────────────────────────── */}
      {loading ? (
        <p>Loading issues…</p>
      ) : issues.length === 0 ? (
        <p style={{ color: '#718096' }}>No issues found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Asset</th>
                <th>Reported By</th>
                <th>Description</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>
                    {issue.asset?.asset_name ?? `#${issue.asset_id}`}
                    <br />
                    <small style={{ color: '#718096' }}>{issue.asset?.serial_number ?? ''}</small>
                  </td>
                  <td>
                    {issue.employee?.name ?? `#${issue.employee_id}`}
                    <br />
                    <small style={{ color: '#718096' }}>{issue.employee?.email ?? ''}</small>
                  </td>
                  <td style={{ maxWidth: '28ch', wordBreak: 'break-word' }}>
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
                  <td>
                    {issue.created_at
                      ? new Date(issue.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <select
                      value={statusDraft[issue.id] ?? issue.status}
                      onChange={(e) => handleStatusDraftChange(issue.id, e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      {ISSUE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(issue.id)}
                      disabled={
                        !statusDraft[issue.id] || statusDraft[issue.id] === issue.status
                      }
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      Save
                    </button>
                  </td>
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

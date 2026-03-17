import { useEffect, useState } from 'react'

import { fetchMyAssignments } from '../services/assignmentService'
import PaginationControls from './PaginationControls'

function MyAssignedAssetsSection({ token }) {
  const [assignments, setAssignments] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 10

  const loadAssignments = async (nextPage = page) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyAssignments(token, { page: nextPage, per_page: perPage })
      setAssignments(data.assignments || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [token])

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadAssignments(nextPage)
  }

  return (
    <section className='card'>
      <h2>My Assigned Assets</h2>

      {loading ? (
        <p>Loading assigned assets...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.id}</td>
                  <td>{assignment.asset?.asset_name || '-'}</td>
                  <td>{assignment.asset?.category || '-'}</td>
                  <td>{assignment.asset?.serial_number || '-'}</td>
                  <td>{assignment.asset?.status || '-'}</td>
                  <td>{assignment.assigned_date || '-'}</td>
                  <td>{assignment.return_date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {error ? <p className='error'>{error}</p> : null}
    </section>
  )
}

export default MyAssignedAssetsSection
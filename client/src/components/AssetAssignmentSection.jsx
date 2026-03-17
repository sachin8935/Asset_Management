import { useEffect, useState } from 'react'

import { fetchAssets } from '../services/assetService'
import PaginationControls from './PaginationControls'
import {
  assignAssetToEmployee,
  fetchAllAssignments,
  returnAssignedAsset,
} from '../services/assignmentService'
import { fetchAllUsers } from '../services/adminService'

function AssetAssignmentSection({ token }) {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [assignments, setAssignments] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [assetId, setAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [assignedDate, setAssignedDate] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 10

  const loadData = async (nextPage = page) => {
    setLoading(true)
    try {
      const [assetData, userData, assignmentData] = await Promise.all([
        fetchAssets(token, { page: 1, per_page: 200 }),
        fetchAllUsers(token, { page: 1, per_page: 200 }),
        fetchAllAssignments(token, { page: nextPage, per_page: perPage }),
      ])
      setAssets(assetData.assets || [])
      setEmployees((userData.users || []).filter((user) => user.role === 'Employee'))
      setAssignments(assignmentData.assignments || [])
      setPagination(assignmentData.pagination || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  const handleAssign = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (!assetId || !employeeId) {
        throw new Error('Please select both asset and employee')
      }

      await assignAssetToEmployee(token, {
        asset_id: Number(assetId),
        employee_id: Number(employeeId),
        assigned_date: assignedDate || undefined,
      })

      setMessage('Asset assigned successfully')
      setAssetId('')
      setEmployeeId('')
      setAssignedDate('')
      await loadData(page)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReturn = async (assignmentId) => {
    setError('')
    setMessage('')
    try {
      await returnAssignedAsset(token, assignmentId, {})
      setMessage('Asset returned successfully')
      await loadData(page)
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadData(nextPage)
  }

  const assignableAssets = assets.filter((asset) => asset.status !== 'Assigned')

  return (
    <section className='card'>
      <h2>Asset Assignment</h2>

      <form className='assignment-form' onSubmit={handleAssign}>
        <select value={assetId} onChange={(event) => setAssetId(event.target.value)} required>
          <option value=''>Select Asset</option>
          {assignableAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.asset_name} ({asset.serial_number})
            </option>
          ))}
        </select>

        <select
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          required
        >
          <option value=''>Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} ({employee.email})
            </option>
          ))}
        </select>

        <input
          type='date'
          value={assignedDate}
          onChange={(event) => setAssignedDate(event.target.value)}
          placeholder='Assigned Date'
        />

        <button type='submit'>Assign Asset</button>
      </form>

      {loading ? (
        <p>Loading assignment data...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Employee</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.id}</td>
                  <td>{assignment.asset?.asset_name || '-'}</td>
                  <td>{assignment.employee?.name || '-'}</td>
                  <td>{assignment.assigned_date || '-'}</td>
                  <td>{assignment.return_date || '-'}</td>
                  <td>
                    {assignment.return_date ? (
                      'Returned'
                    ) : (
                      <button onClick={() => handleReturn(assignment.id)}>Mark Returned</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {error ? <p className='error'>{error}</p> : null}
      {message ? <p className='message'>{message}</p> : null}
    </section>
  )
}

export default AssetAssignmentSection
import { useState } from 'react'

import StatusMessage from '../components/StatusMessage'
import UserTable from '../components/UserTable'
import PaginationControls from '../components/PaginationControls'
import { ROLE_OPTIONS } from '../constants/roles'
import { useUserManagement } from '../hooks/useUserManagement'

function UserManagementPage({ token, currentUser }) {
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserDepartment, setNewUserDepartment] = useState('')
  const [newUserRole, setNewUserRole] = useState('IT Manager')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 10

  const { users, pagination, usersLoading, roleDraft, setRoleDraft, updateRole, createUser, loadUsers } = useUserManagement(
    token,
    true,
  )

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const data = await createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        department: newUserDepartment,
        role: newUserRole,
      })

      setMessage(`${data.user.role} account created for ${data.user.name}`)
      setNewUserName('')
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserDepartment('')
      setNewUserRole('IT Manager')
      if (page !== 1) {
        setPage(1)
      }
      await loadUsers({ page: 1, per_page: perPage })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRoleUpdate = async (userId) => {
    setError('')
    setMessage('')

    try {
      const data = await updateRole(userId, roleDraft[userId])
      setMessage(`Role updated for ${data.user.name}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRoleDraftChange = (userId, role) => {
    setRoleDraft((prev) => ({
      ...prev,
      [userId]: role,
    }))
  }

  const handlePageChange = async (nextPage) => {
    setPage(nextPage)
    await loadUsers({ page: nextPage, per_page: perPage })
  }

  return (
    <section className='card'>
      <h2>User Management</h2>
      <form className='create-user-form' onSubmit={handleCreateUser}>
        <label>
          Name
          <input
            type='text'
            value={newUserName}
            onChange={(event) => setNewUserName(event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type='email'
            value={newUserEmail}
            onChange={(event) => setNewUserEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type='password'
            value={newUserPassword}
            onChange={(event) => setNewUserPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Department
          <input
            type='text'
            value={newUserDepartment}
            onChange={(event) => setNewUserDepartment(event.target.value)}
          />
        </label>
        <label>
          Role
          <select value={newUserRole} onChange={(event) => setNewUserRole(event.target.value)}>
            <option value='IT Manager'>IT Manager</option>
            <option value='Employee'>Employee</option>
          </select>
        </label>
        <button type='submit'>Create User</button>
      </form>

      {usersLoading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <UserTable
            users={users}
            currentUserId={currentUser?.id}
            roleOptions={ROLE_OPTIONS}
            roleDraft={roleDraft}
            onRoleDraftChange={handleRoleDraftChange}
            onUpdateRole={handleRoleUpdate}
          />
          <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      <StatusMessage type='error' text={error} />
      <StatusMessage type='success' text={message} />
    </section>
  )
}

export default UserManagementPage

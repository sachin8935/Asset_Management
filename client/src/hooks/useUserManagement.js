import { useEffect, useState } from 'react'

import { createUserByAdmin, fetchAllUsers, updateUserRole } from '../services/adminService'

export function useUserManagement(token, enabled) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [roleDraft, setRoleDraft] = useState({})

  const loadUsers = async (paginationParams = {}) => {
    if (!token || !enabled) return

    setUsersLoading(true)
    try {
      const data = await fetchAllUsers(token, paginationParams)
      const fetchedUsers = data.users || []
      setUsers(fetchedUsers)
      setPagination(data.pagination || null)

      const draft = {}
      for (const user of fetchedUsers) {
        draft[user.id] = user.role
      }
      setRoleDraft(draft)
      return fetchedUsers
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token, enabled])

  const updateRole = async (userId, role) => {
    const data = await updateUserRole(token, userId, role)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: data.user.role } : user,
      ),
    )
    setRoleDraft((prev) => ({ ...prev, [userId]: data.user.role }))
    return data
  }

  const createUser = async (payload) => {
    const data = await createUserByAdmin(token, payload)
    const createdUser = data.user

    setUsers((prevUsers) => [createdUser, ...prevUsers])
    setRoleDraft((prev) => ({ ...prev, [createdUser.id]: createdUser.role }))
    return data
  }

  return {
    users,
    pagination,
    usersLoading,
    roleDraft,
    setRoleDraft,
    loadUsers,
    updateRole,
    createUser,
    setUsers,
  }
}
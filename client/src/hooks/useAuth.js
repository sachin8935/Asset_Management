import { useState } from 'react'

import { loginUser, registerUser } from '../services/authService'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(() => {
    const rawUser = localStorage.getItem('user')
    return rawUser ? JSON.parse(rawUser) : null
  })
  const [loading, setLoading] = useState(false)

  const isAuthenticated = Boolean(token)
  const isAdmin = currentUser?.role === 'Admin'

  const login = async ({ email, password, expectedRole }) => {
    setLoading(true)
    try {
      const data = await loginUser({ email, password })

      if (expectedRole && data?.user?.role !== expectedRole) {
        throw new Error(`This account is registered as ${data?.user?.role}. Please select the correct role.`)
      }

      setToken(data.access_token)
      setCurrentUser(data.user)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } finally {
      setLoading(false)
    }
  }

  const signup = async (formData) => {
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: 'Employee',
      }
      return await registerUser(payload)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setCurrentUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    signup,
    logout,
  }
}
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

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await loginUser({ email, password })
      setToken(data.access_token)
      setCurrentUser(data.user)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } finally {
      setLoading(false)
    }
  }

  const signup = async ({ name, email, password, department }) => {
    setLoading(true)
    try {
      return await registerUser({
        name,
        email,
        password,
        department,
        role: 'Employee',
      })
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
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getToken, clearSession, saveSession } from '../lib/auth'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(null)   // EmployeeResponseDto
  const [role, setRole] = useState(null)   // 'EMPLOYEE' | 'MANAGER'
  const [loading, setLoading] = useState(true)

  // On mount or token change: fetch profile
  useEffect(() => {
    if (!token) {
      setUser(null)
      setRole(null)
      setLoading(false)
      return
    }
    setLoading(true)
    api.get('/employee/profile')
      .then((res) => {
        setUser(res.data.data)
      })
      .catch(() => {
        // Profile fetch failed, clear session
        clearSession()
        setToken(null)
        setUser(null)
        setRole(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  // Derive role from token by calling /auth/me or checking profile failure
  // Since the backend doesn't expose a /me endpoint, we rely on what we stored at login
  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    if (storedRole) setRole(storedRole)
  }, [token])

  const login = (jwtToken, userRole) => {
    saveSession(jwtToken)
    localStorage.setItem('role', userRole)
    setToken(jwtToken)
    setRole(userRole)
  }

  const logout = () => {
    clearSession()
    localStorage.removeItem('role')
    setToken(null)
    setUser(null)
    setRole(null)
  }

  const refreshProfile = async () => {
    try {
      const res = await api.get('/employee/profile')
      setUser(res.data.data)
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api/auth'
import axios, { setAuthToken } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(localStorage.getItem('agro_access_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      // fetch user info
      void (async () => {
        try {
          const data = await apiMe()
          setUser(data)
        } catch (err) {
          console.error('me failed', err)
          setToken('')
        }
      })()
    }
  }, [])

  function setToken(t) {
    if (t) {
      setAuthToken(t)
      localStorage.setItem('agro_access_token', t)
      setTokenState(t)
    } else {
      setAuthToken('')
      localStorage.removeItem('agro_access_token')
      setTokenState('')
      setUser(null)
    }
  }

  async function login(email, password, userRole) {
    setLoading(true)
    try {
      const res = await apiLogin({ email, password, userRole })
      const accessToken = res.accessToken || res.access_token
      setToken(accessToken)
      const me = await apiMe()
      setUser(me)
      // redirect based on role
      if (me.userRole === 'admin') navigate('/admin-dashboard')
      else if (me.userRole === 'bank') navigate('/bank-dashboard')
      else navigate('/farmer-dashboard')
      return me
    } finally {
      setLoading(false)
    }
  }

  async function signup(payload) {
    setLoading(true)
    try {
      const res = await apiRegister(payload)
      // after signup, navigate to login
      navigate('/login')
      return res
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setToken('')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

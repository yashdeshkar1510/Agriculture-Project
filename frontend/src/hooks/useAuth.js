import { useState } from 'react'

const STORAGE_KEY = 'agro_access_token'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY) || '')

  function saveToken(t) {
    localStorage.setItem(STORAGE_KEY, t)
    setToken(t)
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
  }

  function authFetch(url, opts = {}) {
    const headers = opts.headers || {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(url, {...opts, headers})
  }

  return { token, saveToken, clearToken, authFetch }
}

import { useState } from 'react'
import axiosInstance, { setAuthToken } from '../api/axios'

const STORAGE_KEY = 'agro_access_token'

export function useAuth() {
  const [token, setTokenState] = useState(localStorage.getItem(STORAGE_KEY) || '')

  function saveToken(t) {
    setAuthToken(t)
    setTokenState(t)
  }

  function clearToken() {
    setAuthToken('')
    setTokenState('')
  }

  function authFetch(url, opts = {}) {
    // adapt to axios: support same signature convenience
    const method = (opts.method || 'get').toLowerCase()
    const config = {
      url,
      method,
      headers: opts.headers || {},
    }
    if (opts.body) config.data = opts.body
    if (opts.params) config.params = opts.params
    return axiosInstance.request(config)
  }

  return { token, saveToken, clearToken, authFetch }
}

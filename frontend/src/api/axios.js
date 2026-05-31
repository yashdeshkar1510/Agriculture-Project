import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

let _token = localStorage.getItem('agro_access_token') || ''

export function setAuthToken(token) {
  _token = token
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('agro_access_token', token)
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
    localStorage.removeItem('agro_access_token')
  }
}

// initialize from storage
if (_token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${_token}`
}

// Request interceptor (optional: attach dynamic headers)
axiosInstance.interceptors.request.use(
  (config) => {
    // Can attach extra headers or trace ids here
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: normalize errors and handle auth failures
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      // attempt refresh on 401 once
      if (status === 401) {
        // try to call refresh endpoint to get a new token
        if (!axiosInstance._isRefreshing) {
          axiosInstance._isRefreshing = true
          return axiosInstance
            .post('/auth/refresh')
            .then((r) => {
              const newToken = r.data?.accessToken || r.data?.access_token
              if (newToken) setAuthToken(newToken)
              axiosInstance._isRefreshing = false
              // retry original request
              error.config.headers['Authorization'] = axiosInstance.defaults.headers.common['Authorization']
              return axiosInstance.request(error.config)
            })
            .catch(() => {
              axiosInstance._isRefreshing = false
              setAuthToken('')
              return Promise.reject({ status, data: error.response.data, message: error.response.data?.detail || 'Authentication failed' })
            })
        }
      }

      if (status === 403) {
        setAuthToken('')
      }

      const normalized = {
        status: status,
        data: error.response.data,
        message: error.response.data?.detail || error.message || 'Request failed',
      }
      return Promise.reject(normalized)
    }
    return Promise.reject({ message: error.message || 'Network Error' })
  }
)

export default axiosInstance

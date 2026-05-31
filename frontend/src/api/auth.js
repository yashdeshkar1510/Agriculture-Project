import axios from './axios'

export async function login({ email, password, userRole }) {
  const res = await axios.post('/auth/login', { email, password, userRole })
  return res.data
}

export async function register(payload) {
  const res = await axios.post('/auth/register', payload)
  return res.data
}

export async function me() {
  const res = await axios.get('/auth/me')
  return res.data
}

import axios from './axios'

export async function listUsers(params = {}) {
  const res = await axios.get('/admin/users', { params })
  return res.data
}

export async function createUser(payload) {
  const res = await axios.post('/admin/users', payload)
  return res.data
}

export async function updateUserRole(userId, role) {
  const res = await axios.put(`/admin/users/${userId}/role`, null, { params: { role } })
  return res.data
}

export async function deleteUser(userId) {
  const res = await axios.delete(`/admin/users/${userId}`)
  return res.data
}

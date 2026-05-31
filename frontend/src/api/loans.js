import axios from './axios'

export async function listApplications(params = {}) {
  const res = await axios.get('/loan/applications', { params })
  return res.data
}

export async function approveApplication(id) {
  const res = await axios.post(`/loan/applications/${id}/approve`)
  return res.data
}

export async function rejectApplication(id) {
  const res = await axios.post(`/loan/applications/${id}/reject`)
  return res.data
}

export async function exportApplications(params = {}) {
  const res = await axios.get('/bank/export/applications', { params, responseType: 'blob' })
  return res.data
}

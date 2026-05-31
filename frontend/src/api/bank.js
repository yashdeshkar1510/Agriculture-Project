import axios from './axios'

export async function listFarmers(params = {}) {
  const res = await axios.get('/bank/farmers', { params })
  return res.data
}

export async function getAnalytics(params = {}) {
  const res = await axios.get('/bank/analytics', { params })
  return res.data
}

export async function exportApplications(params = {}) {
  const res = await axios.get('/bank/export/applications', { params, responseType: 'blob' })
  return res.data
}

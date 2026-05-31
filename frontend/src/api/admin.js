import axios from './axios'

export async function getAudit(params = {}) {
  const res = await axios.get('/admin/audit', { params })
  return res.data
}

export async function getOverview() {
  const res = await axios.get('/admin/overview')
  return res.data
}

import axios from './axios'

export async function searchWeather(payload) {
  const res = await axios.post('/weather/search', payload)
  return res.data
}

export async function listHistory(params = {}) {
  const res = await axios.get('/weather/history', { params })
  return res.data
}

export async function deleteHistory(id) {
  const res = await axios.delete(`/weather/history/${id}`)
  return res.data
}

import axios from './axios'

export async function getRecommendation(payload) {
  const res = await axios.post('/loan/recommendation', payload)
  return res.data
}

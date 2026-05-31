import axios from './axios'

export async function getOverview() {
  const res = await axios.get('/analytics/overview')
  return res.data
}

export async function getTimeseries(metric = 'loans', interval = 'monthly') {
  const res = await axios.get('/analytics/timeseries', { params: { metric, interval } })
  return res.data
}

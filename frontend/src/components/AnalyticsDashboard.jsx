import { useEffect, useMemo, useState } from 'react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { getOverview as apiOverview } from '../api/analytics'
import { useError } from '../contexts/ErrorContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function AnalyticsDashboard({ authFetch }) {
  const [data, setData] = useState(null)
  const { showError } = useError()
  const [district, setDistrict] = useState('')
  const [crop, setCrop] = useState('')

  const load = async () => {
    try {
      const json = await apiOverview()
      setData(json)
    } catch (err) {
      showError(err)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const farmerDist = useMemo(() => {
    if (!data) return null
    const labels = Object.keys(data.farmer_distribution)
    const values = Object.values(data.farmer_distribution)
    return { labels, datasets: [{ label: 'Farmers', data: values, backgroundColor: 'rgba(34,197,94,0.8)' }] }
  }, [data])

  const loanStats = useMemo(() => {
    if (!data) return null
    const stats = data.loan_approval_stats
    return {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{ label: 'Loans', data: [stats.approved, stats.pending, stats.rejected], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'] }],
    }
  }, [data])

  const riskPie = useMemo(() => {
    if (!data) return null
    const r = data.risk_category_analysis
    return { labels: ['High', 'Medium', 'Low'], datasets: [{ data: [r.high, r.medium, r.low], backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'] }] }
  }, [data])

  const districtData = useMemo(() => {
    if (!data) return null
    const labels = Object.keys(data.district_wise)
    const values = Object.values(data.district_wise)
    return { labels, datasets: [{ label: 'Farmers', data: values, backgroundColor: 'rgba(59,130,246,0.8)' }] }
  }, [data])

  const cropTrends = useMemo(() => {
    if (!data) return null
    const labels = Object.keys(data.crop_trends)
    const values = Object.values(data.crop_trends)
    return { labels, datasets: [{ label: 'Records', data: values, borderColor: 'rgba(34,197,94,0.9)', backgroundColor: 'rgba(34,197,94,0.2)' }] }
  }, [data])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
        <div className="flex items-center gap-2">
          <input placeholder="Filter district" value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" />
          <input placeholder="Filter crop" value={crop} onChange={(e) => setCrop(e.target.value)} className="input-field" />
          <button onClick={() => void load()} className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950">Refresh</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">Farmer Distribution</h4>
          {farmerDist ? <Bar data={farmerDist} /> : <p className="text-sm text-slate-400">Loading...</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">Loan Approval Stats</h4>
          {loanStats ? <Bar data={loanStats} /> : <p className="text-sm text-slate-400">Loading...</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">Risk Category Analysis</h4>
          {riskPie ? <Pie data={riskPie} /> : <p className="text-sm text-slate-400">Loading...</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">District-wise Analytics</h4>
          {districtData ? <Bar data={districtData} /> : <p className="text-sm text-slate-400">Loading...</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">Crop Performance Trends</h4>
          {cropTrends ? <Line data={cropTrends} /> : <p className="text-sm text-slate-400">Loading...</p>}
        </div>
      </div>
    </div>
  )
}

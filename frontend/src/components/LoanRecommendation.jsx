import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { getRecommendation } from '../api/recommendation'
import { useError } from '../contexts/ErrorContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function LoanRecommendation({ authFetch }) {
  const [form, setForm] = useState({ annual_income: '', farm_size_hectares: '', credit_score: '', years_farming: '', existing_debt: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const { showError } = useError()

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = {
        annual_income: Number(form.annual_income || 0),
        farm_size_hectares: Number(form.farm_size_hectares || 0),
        credit_score: form.credit_score ? Number(form.credit_score) : undefined,
        years_farming: form.years_farming ? Number(form.years_farming) : 0,
        existing_debt: form.existing_debt ? Number(form.existing_debt) : 0,
      }
      const data = await getRecommendation(payload)
      setResult(data)
    } catch (err) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = result
    ? {
        labels: ['Recommended'],
        datasets: [
          {
            label: 'Recommended Amount',
            data: [result.recommended_amount],
            borderColor: 'rgba(34,197,94,0.9)',
            backgroundColor: 'rgba(34,197,94,0.2)',
          },
          {
            label: 'Confidence (scaled)',
            data: [result.confidence * result.recommended_amount],
            borderColor: 'rgba(59,130,246,0.9)',
            backgroundColor: 'rgba(59,130,246,0.2)',
          },
        ],
      }
    : null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white">Loan Recommendation</h3>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-300">Annual income</span>
          <input name="annual_income" value={form.annual_income} onChange={onChange} className="input-field mt-2" placeholder="e.g., 30000" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Farm size (ha)</span>
          <input name="farm_size_hectares" value={form.farm_size_hectares} onChange={onChange} className="input-field mt-2" placeholder="e.g., 1.5" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Credit score (optional)</span>
          <input name="credit_score" value={form.credit_score} onChange={onChange} className="input-field mt-2" placeholder="0-850" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Years farming</span>
          <input name="years_farming" value={form.years_farming} onChange={onChange} className="input-field mt-2" placeholder="e.g., 3" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Existing debt</span>
          <input name="existing_debt" value={form.existing_debt} onChange={onChange} className="input-field mt-2" placeholder="e.g., 1000" />
        </label>

        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="mt-2 rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950">
            {loading ? 'Running...' : 'Get Recommendation'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 rounded-md bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {result && (
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Recommended amount</p>
            <p className="text-2xl font-bold text-white">{result.recommended_amount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Interest: {(result.interest_rate * 100).toFixed(1)}% · Term: {result.repayment_months} months</p>
            <p className="mt-2 text-sm text-slate-300">Eligibility: {result.eligible ? 'Eligible' : 'Not eligible'}</p>
            <p className="mt-1 text-xs text-slate-400">{result.risk_explanation}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h4 className="text-sm text-slate-300">Visual</h4>
            {chartData ? <Line data={chartData} /> : <p className="text-sm text-slate-400">Run a recommendation to see visualization.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function BankDashboard({ authFetch }) {
  const [view, setView] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')

  const loadAnalytics = async () => {
    const res = await authFetch(`${API}/bank/analytics`)
    const data = await res.json()
    setAnalytics(data)
  }

  const loadFarmers = async () => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (riskFilter) q.set('risk', riskFilter)
    const res = await authFetch(`${API}/bank/farmers?${q.toString()}`)
    const data = await res.json()
    setFarmers(data.items ?? data)
  }

  const loadApplications = async () => {
    const res = await authFetch(`${API}/loan/applications`)
    const data = await res.json()
    setApplications(data)
  }

  useEffect(() => {
    void loadAnalytics()
    void loadFarmers()
    void loadApplications()
  }, [])

  const approve = async (id) => {
    await authFetch(`${API}/loan/applications/${id}/approve`, { method: 'POST' })
    await loadApplications()
    await loadAnalytics()
  }

  const reject = async (id) => {
    await authFetch(`${API}/loan/applications/${id}/reject`, { method: 'POST' })
    await loadApplications()
    await loadAnalytics()
  }

  const exportApplications = async () => {
    const res = await authFetch(`${API}/bank/export/applications`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'loan_applications.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const cards = useMemo(() => {
    return [
      { key: 'total', label: 'Total Farmers', value: analytics?.total_farmers ?? 0 },
      { key: 'approved', label: 'Approved Loans', value: analytics?.approved_loans ?? 0 },
      { key: 'pending', label: 'Pending Loans', value: analytics?.pending_loans ?? 0 },
      { key: 'highrisk', label: 'High Risk Farmers', value: analytics?.high_risk_farmers ?? 0 },
    ]
  }, [analytics])

  const barData = {
    labels: ['Approved', 'Pending', 'High Risk'],
    datasets: [
      {
        label: 'Counts',
        data: [analytics?.approved_loans ?? 0, analytics?.pending_loans ?? 0, analytics?.high_risk_farmers ?? 0],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      },
    ],
  }

  return (
    <div className="flex min-h-[72vh] gap-6">
      <aside className="w-64 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white">Bank Officer</h4>
        <nav className="mt-4 flex flex-col gap-2">
          <button onClick={() => setView('overview')} className={`text-left rounded px-3 py-2 ${view === 'overview' ? 'bg-emerald-400/10' : ''}`}>Overview</button>
          <button onClick={() => setView('farmers')} className={`text-left rounded px-3 py-2 ${view === 'farmers' ? 'bg-emerald-400/10' : ''}`}>Farmers</button>
          <button onClick={() => setView('loans')} className={`text-left rounded px-3 py-2 ${view === 'loans' ? 'bg-emerald-400/10' : ''}`}>Loan Applications</button>
          <button onClick={() => setView('analytics')} className={`text-left rounded px-3 py-2 ${view === 'analytics' ? 'bg-emerald-400/10' : ''}`}>Analytics</button>
        </nav>
      </aside>

      <main className="flex-1">
        {view === 'overview' && (
          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {cards.map((c) => (
                <div key={c.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{c.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-300">Recent Applications</h4>
                <div className="mt-3 space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                      <div>
                        <p className="font-semibold text-white">{app.applicant?.annual_income?.toLocaleString ? app.applicant.annual_income.toLocaleString() : app.applicant.annual_income}</p>
                        <p className="text-sm text-slate-400">{app.recommendation?.interest_rate * 100}% · {app.recommendation?.repayment_months} months</p>
                      </div>
                      <div className="flex gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button onClick={() => approve(app.id)} className="rounded bg-emerald-400 px-3 py-1 text-sm font-semibold text-slate-950">Approve</button>
                            <button onClick={() => reject(app.id)} className="rounded bg-rose-400 px-3 py-1 text-sm font-semibold text-white">Reject</button>
                          </>
                        )}
                        <div className="text-sm text-slate-400">{app.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-300">Overview Chart</h4>
                <div className="mt-3">
                  <Bar data={barData} />
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'farmers' && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Farmers</h3>
              <div className="flex items-center gap-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="input-field" />
                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-field">
                  <option value="">All risks</option>
                  <option value="high">High risk</option>
                </select>
                <button onClick={() => loadFarmers()} className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950">Apply</button>
              </div>
            </div>

            <div className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-slate-400">
                    <th className="p-3">Name</th>
                    <th>Village</th>
                    <th>Credit</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f) => (
                    <tr key={f.id} className="border-t border-white/5">
                      <td className="p-3 text-white">{f.name}</td>
                      <td className="p-3 text-slate-300">{f.village}</td>
                      <td className="p-3 text-slate-300">{f.credit_score ?? '—'}</td>
                      <td className="p-3 text-slate-300">{f.credit_score && f.credit_score < 400 ? 'High' : 'Normal'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === 'loans' && (
          <section>
            <h3 className="text-lg font-semibold text-white">Loan Applications</h3>
            <div className="mt-4 space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                  <div>
                    <p className="font-semibold text-white">{app.applicant?.annual_income?.toLocaleString ? app.applicant.annual_income.toLocaleString() : app.applicant.annual_income}</p>
                    <p className="text-sm text-slate-400">{app.recommendation?.interest_rate * 100}% · {app.recommendation?.repayment_months} months</p>
                  </div>
                  <div className="flex gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => approve(app.id)} className="rounded bg-emerald-400 px-3 py-1 text-sm font-semibold text-slate-950">Approve</button>
                        <button onClick={() => reject(app.id)} className="rounded bg-rose-400 px-3 py-1 text-sm font-semibold text-white">Reject</button>
                      </>
                    )}
                    <div className="text-sm text-slate-400">{app.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'analytics' && (
          <section>
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-300">Loan distribution</h4>
                <Bar data={barData} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-300">Notes</h4>
                <p className="text-sm text-slate-400">This dashboard shows quick summaries; integrate deeper KPIs as needed.</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

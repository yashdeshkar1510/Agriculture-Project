import { useEffect, useState } from 'react'

export default function AdminPanel({ authFetch }) {
  const [users, setUsers] = useState([])
  const [audits, setAudits] = useState([])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newUser, setNewUser] = useState({ fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '', userRole: 'bank' })

  const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

  const loadUsers = async () => {
    const res = await authFetch(`${API}/admin/users`)
    if (!res.ok) return
    const json = await res.json()
    setUsers(json.items || json)
  }

  const loadAudits = async () => {
    const res = await authFetch(`${API}/admin/audit`)
    if (!res.ok) return
    const json = await res.json()
    setAudits(json.items || json)
  }

  const loadOverview = async () => {
    const res = await authFetch(`${API}/admin/overview`)
    if (!res.ok) return
    const json = await res.json()
    setOverview(json)
  }

  useEffect(() => {
    void loadUsers()
    void loadAudits()
    void loadOverview()
  }, [])

  const createUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...newUser }
      const res = await authFetch(`${API}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      await loadUsers()
      setNewUser({ fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '', userRole: 'bank' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Admin Panel</h3>
        <div className="text-sm text-slate-400">Role-based system management</div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm text-slate-300">Manage Users</h4>
          <form onSubmit={createUser} className="mt-3 space-y-2">
            <input placeholder="Full name" value={newUser.fullName} onChange={(e)=>setNewUser(s=>({...s, fullName:e.target.value}))} className="input-field" />
            <input placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser(s=>({...s, email:e.target.value}))} className="input-field" />
            <input placeholder="Mobile" value={newUser.mobileNumber} onChange={(e)=>setNewUser(s=>({...s, mobileNumber:e.target.value}))} className="input-field" />
            <select value={newUser.userRole} onChange={(e)=>setNewUser(s=>({...s, userRole:e.target.value}))} className="input-field">
              <option value="bank">Bank Officer</option>
              <option value="admin">Admin</option>
            </select>
            <input placeholder="Password" type="password" value={newUser.password} onChange={(e)=>setNewUser(s=>({...s, password:e.target.value}))} className="input-field" />
            <input placeholder="Confirm" type="password" value={newUser.confirmPassword} onChange={(e)=>setNewUser(s=>({...s, confirmPassword:e.target.value}))} className="input-field" />
            <button className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950" disabled={loading}>{loading? 'Creating...' : 'Create User'}</button>
          </form>

          <div className="mt-4 max-h-60 overflow-auto">
            {users.map(u=> (
              <div key={u.id} className="flex items-center justify-between gap-2 border-t border-white/5 py-2">
                <div>
                  <div className="text-white font-semibold">{u.full_name || u.fullName}</div>
                  <div className="text-sm text-slate-400">{u.email}</div>
                </div>
                <div className="text-sm text-slate-400">{u.user_role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <h4 className="text-sm text-slate-300">Overview</h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Farmers by region</p>
              <pre className="text-sm text-white mt-2">{JSON.stringify(overview?.farmers_by_region ?? {}, null, 2)}</pre>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Loan stats</p>
              <pre className="text-sm text-white mt-2">{JSON.stringify(overview?.loan_stats ?? {}, null, 2)}</pre>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Risk</p>
              <pre className="text-sm text-white mt-2">{JSON.stringify(overview?.risk_analysis ?? {}, null, 2)}</pre>
            </div>
          </div>

          <h4 className="mt-4 text-sm text-slate-300">Audit Logs</h4>
          <div className="mt-2 max-h-48 overflow-auto">
            {audits.map(a=> (
              <div key={a.id} className="border-t border-white/5 py-2">
                <div className="text-sm text-slate-400">{a.actor} · {a.action}</div>
                <div className="text-xs text-slate-500">{a.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function Login() {
  const { saveToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('bank')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userRole: role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      saveToken(data.accessToken)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
        <option value="bank">Bank Officer</option>
        <option value="farmer">Farmer</option>
      </select>
      <button type="submit" className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950">Login</button>
      {error && <div className="text-rose-300">{error}</div>}
    </form>
  )
}

import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useError } from '../contexts/ErrorContext'

export default function Login() {
  const { login } = useAuthContext()
  const { showError } = useError()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('farmer')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password, role)
    } catch (err) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
        <option value="farmer">Farmer</option>
        <option value="bank">Bank Officer</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={loading} className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950">{loading? 'Signing in...' : 'Login'}</button>
    </form>
  )
}

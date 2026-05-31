import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { login } from '../api/auth'
import { useError } from '../contexts/ErrorContext'

export default function Login() {
  const { saveToken } = useAuth()
  const { showError } = useError()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('bank')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const data = await login({ email, password, userRole: role })
      saveToken(data.accessToken || data.access_token)
    } catch (err) {
      showError(err)
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
    </form>
  )
}

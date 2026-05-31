import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useError } from '../../contexts/ErrorContext'

export default function Signup() {
  const { signup } = useAuthContext()
  const { showError } = useError()
  const [form, setForm] = useState({ fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '', userRole: 'farmer' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
        userRole: form.userRole,
      })
    } catch (err) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <input placeholder="Full name" value={form.fullName} onChange={(e)=>setForm(s=>({...s, fullName:e.target.value}))} className="input-field" />
      <input placeholder="Email" value={form.email} onChange={(e)=>setForm(s=>({...s, email:e.target.value}))} className="input-field" />
      <input placeholder="Mobile" value={form.mobileNumber} onChange={(e)=>setForm(s=>({...s, mobileNumber:e.target.value}))} className="input-field" />
      <select value={form.userRole} onChange={(e)=>setForm(s=>({...s, userRole:e.target.value}))} className="input-field">
        <option value="farmer">Farmer</option>
        <option value="bank">Bank Officer</option>
        <option value="admin">Admin</option>
      </select>
      <input placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm(s=>({...s, password:e.target.value}))} className="input-field" />
      <input placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={(e)=>setForm(s=>({...s, confirmPassword:e.target.value}))} className="input-field" />
      <button disabled={loading} className="rounded bg-emerald-400 px-3 py-2 font-semibold text-slate-950">{loading? 'Signing up...' : 'Sign up'}</button>
    </form>
  )
}

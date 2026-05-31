import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-3xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Agro Platform</h1>
        <p className="text-lg text-slate-300 mb-6">Weather intelligence, loan recommendations, bank dashboards and admin management for smallholder agriculture.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-slate-950">Login</Link>
          <Link to="/signup" className="rounded border border-white/10 px-4 py-2">Sign up</Link>
        </div>
      </div>
    </div>
  )
}

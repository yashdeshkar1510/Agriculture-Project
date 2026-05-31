import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-slate-900/80 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white font-bold">Agro Platform</Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Link to="/weather">Weather</Link>
          <Link to="/loan-recommendation">Loan</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </nav>
  )
}

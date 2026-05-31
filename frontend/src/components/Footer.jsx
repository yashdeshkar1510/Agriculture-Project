import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-slate-900/80 border-t border-white/5 text-slate-400 text-sm py-4 mt-8">
      <div className="mx-auto max-w-7xl px-4">© {new Date().getFullYear()} Agro Platform</div>
    </footer>
  )
}

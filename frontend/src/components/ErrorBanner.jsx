import React from 'react'
import { useError } from '../contexts/ErrorContext'

export default function ErrorBanner() {
  const { error } = useError()
  if (!error) return null
  return (
    <div className="fixed left-1/2 top-4 z-50 w-[min(90%,560px)] -translate-x-1/2 rounded-lg bg-rose-600/90 px-4 py-3 text-white shadow-lg">
      {error}
    </div>
  )
}

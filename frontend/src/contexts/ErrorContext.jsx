import { createContext, useContext, useState } from 'react'

const ErrorContext = createContext(null)

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)

  function showError(err) {
    const message = err?.message || (err && typeof err === 'string' ? err : 'An error occurred')
    setError(message)
    setTimeout(() => setError(null), 6000)
  }

  function clearError() {
    setError(null)
  }

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>{children}</ErrorContext.Provider>
  )
}

export function useError() {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useError must be used within ErrorProvider')
  return ctx
}

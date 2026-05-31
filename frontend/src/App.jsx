import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  BarChart3,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  Eye,
  History,
  Landmark,
  LoaderCircle,
  MapPin,
  Search,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Trash2,
  Wind,
} from 'lucide-react'
import './App.css'
import LoanRecommendation from './components/LoanRecommendation'
import BankDashboard from './components/BankDashboard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AdminPanel from './components/AdminPanel'
import ErrorBanner from './components/ErrorBanner'
import { ErrorProvider } from './contexts/ErrorContext'
import Login from './components/Login'
import { useAuth } from './hooks/useAuth'
import { listHistory as apiListHistory, searchWeather as apiSearchWeather, deleteHistory as apiDeleteHistory } from './api/weather'
import { useError } from './contexts/ErrorContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function App() {
  const { token, saveToken, clearToken, authFetch } = useAuth()
  const [location, setLocation] = useState('')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedHistoryId, setSelectedHistoryId] = useState('')
  const [loadingCurrent, setLoadingCurrent] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('idle')

  const activeWeather = useMemo(() => {
    if (selectedHistoryId) {
      return history.find((item) => item.id === selectedHistoryId) ?? currentWeather
    }

    return currentWeather ?? history[0] ?? null
  }, [currentWeather, history, selectedHistoryId])

  const weatherCards = useMemo(() => {
    if (!activeWeather) return []

    return [
      {
        label: 'Temperature',
        value: `${activeWeather.temperature.toFixed(1)}°C`,
        note: 'Current air temperature',
        icon: ThermometerSun,
      },
      {
        label: 'Humidity',
        value: `${activeWeather.humidity}%`,
        note: 'Relative humidity',
        icon: Droplets,
      },
      {
        label: 'Rainfall',
        value: `${activeWeather.rainfall.toFixed(1)} mm`,
        note: 'Measured rainfall',
        icon: CloudRain,
      },
      {
        label: 'Wind Speed',
        value: `${activeWeather.windSpeed.toFixed(1)} m/s`,
        note: 'Wind intensity',
        icon: Wind,
      },
    ]
  }, [activeWeather])

  const weatherTrend = useMemo(() => {
    const samples = [...history].slice(0, 5).reverse()

    if (!samples.length) {
      return null
    }

    const temperatures = samples.map((record) => record.temperature)
    const humidities = samples.map((record) => record.humidity)
    const rainfalls = samples.map((record) => record.rainfall)
    const windSpeeds = samples.map((record) => record.windSpeed)

    return {
      samples,
      averages: {
        temperature: temperatures.reduce((total, value) => total + value, 0) / samples.length,
        humidity: humidities.reduce((total, value) => total + value, 0) / samples.length,
        rainfall: rainfalls.reduce((total, value) => total + value, 0) / samples.length,
        windSpeed: windSpeeds.reduce((total, value) => total + value, 0) / samples.length,
      },
      peaks: {
        temperature: Math.max(...temperatures, 1),
        humidity: Math.max(...humidities, 1),
        rainfall: Math.max(...rainfalls, 1),
        windSpeed: Math.max(...windSpeeds, 1),
      },
    }
  }, [history])

  const loadHistory = async () => {
    setLoadingHistory(true)

    try {
      const data = await apiListHistory({ limit: 8 })
      setHistory(data)
      setSelectedHistoryId((currentSelected) => {
        if (currentSelected && data.some((entry) => entry.id === currentSelected)) {
          return currentSelected
        }
        return data[0]?.id ?? ''
      })
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || String(error))
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadHistory())
  }, [])

  const searchWeather = async (event) => {
    event.preventDefault()

    const trimmedLocation = location.trim()
    if (!trimmedLocation) {
      setMessageType('error')
      setMessage('Enter a village or location to fetch weather details.')
      return
    }

    setLoadingCurrent(true)
    setMessage('')

    try {
      const data = await apiSearchWeather({ location: trimmedLocation })
      setCurrentWeather(data)
      setSelectedHistoryId(data.id)
      setLocation('')
      setMessageType('success')
      setMessage(`Weather updated for ${data.resolvedLocation}.`)
      await loadHistory()
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || String(error))
    } finally {
      setLoadingCurrent(false)
    }
  }

  const deleteHistoryItem = async (record) => {
    const shouldDelete = window.confirm(`Remove weather history for ${record.resolvedLocation}?`)
    if (!shouldDelete) return

    setDeletingId(record.id)

    try {
      await apiDeleteHistory(record.id)
      setMessageType('success')
      setMessage('Weather history entry removed successfully.')
      if (selectedHistoryId === record.id) {
        setSelectedHistoryId('')
        setCurrentWeather(null)
      }
      await loadHistory()
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || String(error))
    } finally {
      setDeletingId('')
    }
  }

  return (
    <ErrorProvider>
    <div className="min-h-screen bg-[#04141f] text-slate-100">
      <ErrorBanner />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_24%),linear-gradient(180deg,rgba(4,20,31,0.4),rgba(4,20,31,1))]" />
        <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-drift-slower" />

        <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                  Agro Platform
                </p>
                <p className="text-sm text-slate-300">Weather intelligence module</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Powered by OpenWeather API and MongoDB history tracking</div>
              <div className="ml-auto">
                {token ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => clearToken()} className="rounded bg-rose-400/10 px-3 py-1 text-sm text-rose-300">Logout</button>
                  </div>
                ) : (
                  <Login />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Real-time village weather intelligence
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Weather intelligence for smarter farm decisions.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    Search any village or location and get temperature, humidity, rainfall, wind speed,
                    and weather condition powered by OpenWeather.
                  </p>
                </div>

                <form onSubmit={searchWeather} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <MapPin className="h-4 w-4 text-emerald-300" />
                      Village / Location
                    </span>
                    <div className="relative">
                      <input
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        className="input-field pr-28"
                        placeholder="Enter village, town, or city"
                      />
                      <button
                        type="submit"
                        disabled={loadingCurrent}
                        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loadingCurrent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Search
                      </button>
                    </div>
                  </label>

                  {message && (
                    <div
                      className={`rounded-2xl border px-4 py-4 text-sm ${
                        messageType === 'success'
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                          : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </form>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Temperature and humidity cards',
                    'Rainfall and wind speed metrics',
                    'Weather history with timestamps',
                    'Responsive mobile-first layout',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-200"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                        Current weather
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">
                        {activeWeather?.resolvedLocation ?? 'Search a location to begin'}
                      </h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {activeWeather ? activeWeather.condition : 'Idle'}
                    </div>
                  </div>

                  {activeWeather ? (
                    <>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {weatherCards.map(({ label, value, note, icon: Icon }) => (
                          <article
                            key={label}
                            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-300">{label}</p>
                              <Icon className="h-5 w-5 text-emerald-300" />
                            </div>
                            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
                            <p className="mt-2 text-xs text-slate-400">{note}</p>
                          </article>
                        ))}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-blue-500/10 p-4">
                          <div className="flex items-center gap-3">
                            <SunMedium className="h-5 w-5 text-emerald-300" />
                            <div>
                              <p className="text-sm text-slate-300">Condition</p>
                              <p className="text-lg font-semibold text-white">{activeWeather.condition}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{activeWeather.description}</p>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <Clock3 className="h-5 w-5 text-emerald-300" />
                            <div>
                              <p className="text-sm text-slate-300">Last updated</p>
                              <p className="text-lg font-semibold text-white">
                                {new Date(activeWeather.fetchedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
                      Search a village or location to load live weather cards.
                    </div>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Weather cards</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Farm-ready snapshot</h2>
                    </div>
                    <CloudSun className="h-5 w-5 text-emerald-300" />
                  </div>

                  {activeWeather ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      {[
                        ['Temperature', `${activeWeather.temperature.toFixed(1)} °C`],
                        ['Humidity', `${activeWeather.humidity}%`],
                        ['Rainfall', `${activeWeather.rainfall.toFixed(1)} mm`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-300">{label}</p>
                          <p className="mt-3 text-2xl font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                      Weather cards appear here after you search a location.
                    </p>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Trend view</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Recent weather movement</h2>
                    </div>
                    <BarChart3 className="h-5 w-5 text-emerald-300" />
                  </div>

                  {weatherTrend ? (
                    <div className="mt-5 space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <TrendStat
                          label="Avg temperature"
                          value={`${weatherTrend.averages.temperature.toFixed(1)} °C`}
                        />
                        <TrendStat label="Avg humidity" value={`${weatherTrend.averages.humidity.toFixed(0)}%`} />
                        <TrendStat
                          label="Avg rainfall"
                          value={`${weatherTrend.averages.rainfall.toFixed(1)} mm`}
                        />
                        <TrendStat
                          label="Avg wind speed"
                          value={`${weatherTrend.averages.windSpeed.toFixed(1)} m/s`}
                        />
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-400">Temperature trend</p>
                            <p className="text-lg font-semibold text-white">Latest 5 searches</p>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                            Chronological view
                          </span>
                        </div>

                        <div className="mt-5 flex h-44 items-end gap-3 overflow-x-auto pb-2">
                          {weatherTrend.samples.map((record) => {
                            const height = Math.max(20, (record.temperature / weatherTrend.peaks.temperature) * 100)

                            return (
                              <div key={record.id} className="flex min-w-[92px] flex-1 flex-col items-center gap-2">
                                <div className="flex h-32 w-full items-end rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-2">
                                  <div
                                    className="trend-bar w-full rounded-[1rem] bg-gradient-to-t from-emerald-500 via-teal-400 to-blue-400 shadow-lg shadow-emerald-500/20"
                                    style={{ height: `${height}%` }}
                                  />
                                </div>
                                <div className="text-center text-xs text-slate-400">
                                  <p className="font-semibold text-slate-200">{record.resolvedLocation}</p>
                                  <p>{new Date(record.fetchedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {weatherTrend.samples.map((record) => (
                            <div key={record.id} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {new Date(record.fetchedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-white">{record.condition}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {record.temperature.toFixed(1)}°C · {record.humidity}% humidity
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
                      Search a few locations to build a weather trend.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">History</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Weather history</h2>
              </div>
              {loadingHistory ? <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" /> : <History className="h-5 w-5 text-emerald-300" />}
            </div>

            <div className="mt-6">
              {loadingHistory ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-44 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
                  No weather history yet. Run a search to create the first entry.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {history.map((record) => {
                    const selected = selectedHistoryId === record.id

                    return (
                      <article
                        key={record.id}
                        className={`rounded-[1.5rem] border p-5 shadow-lg shadow-black/10 transition hover:-translate-y-1 ${
                          selected
                            ? 'border-emerald-400/40 bg-emerald-400/10'
                            : 'border-white/10 bg-slate-950/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-white">{record.resolvedLocation}</p>
                            <p className="mt-1 text-sm text-slate-400">{record.description}</p>
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                            {record.condition}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                          <MiniStat label="Temp" value={`${record.temperature.toFixed(1)}°C`} />
                          <MiniStat label="Humidity" value={`${record.humidity}%`} />
                          <MiniStat label="Rain" value={`${record.rainfall.toFixed(1)}mm`} />
                          <MiniStat label="Wind" value={`${record.windSpeed.toFixed(1)}m/s`} />
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
                          {new Date(record.fetchedAt).toLocaleString()}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryId(record.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHistoryItem(record)}
                            disabled={deletingId === record.id}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === record.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <LoanRecommendation authFetch={authFetch} />
            </div>
            <div>
              <BankDashboard authFetch={authFetch} />
            </div>
            <div>
              <AnalyticsDashboard authFetch={authFetch} />
            </div>
            <div>
              <AdminPanel authFetch={authFetch} />
            </div>
          </section>
        </main>
      </div>
    </div>
    </ErrorProvider>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function TrendStat({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default App

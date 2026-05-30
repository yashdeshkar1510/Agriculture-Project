import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Landmark,
  Leaf,
  LineChart,
  LoaderCircle,
  PencilLine,
  ShieldCheck,
  Trash2,
  Wheat,
  Building2,
  MapPin,
} from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const steps = [
  { id: 1, title: 'Crop Details' },
  { id: 2, title: 'Production Data' },
  { id: 3, title: 'Income & Review' },
]

const initialFormState = {
  cropName: '',
  cropSeason: '',
  areaCultivated: '',
  soilType: '',
  previousYield: '',
  currentYield: '',
  fertilizerUsage: '',
  irrigationSource: '',
  pestIncidents: '',
  annualFarmIncome: '',
}

const initialErrors = {
  cropName: '',
  cropSeason: '',
  areaCultivated: '',
  soilType: '',
  previousYield: '',
  currentYield: '',
  fertilizerUsage: '',
  irrigationSource: '',
  pestIncidents: '',
  annualFarmIncome: '',
}

function App() {
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState(initialErrors)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('idle')

  const stats = useMemo(() => {
    const totalArea = records.reduce((sum, record) => sum + Number(record.areaCultivated || 0), 0)
    const totalIncome = records.reduce((sum, record) => sum + Number(record.annualFarmIncome || 0), 0)
    const averageYieldChange = records.length
      ? records.reduce((sum, record) => sum + Number(record.yieldChange || 0), 0) / records.length
      : 0

    return [
      { label: 'Records', value: records.length },
      { label: 'Total Area', value: totalArea.toFixed(1) },
      { label: 'Annual Income', value: totalIncome.toFixed(0) },
      { label: 'Avg Yield Change', value: averageYieldChange.toFixed(1) },
    ]
  }, [records])

  const loadRecords = async () => {
    setLoadingList(true)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farm-records`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load farm records.')
      }

      setRecords(data)
      setSelectedRecord((currentSelected) => {
        if (currentSelected && data.some((record) => record.id === currentSelected.id)) {
          return currentSelected
        }
        return data[0] ?? null
      })
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadRecords())
  }, [])

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setNotice('')
  }

  const validateStep = (step) => {
    const nextErrors = { ...initialErrors }

    if (step === 1 || step === 3) {
      if (formData.cropName.trim().length < 2) {
        nextErrors.cropName = 'Crop name is required.'
      }

      if (formData.cropSeason.trim().length < 2) {
        nextErrors.cropSeason = 'Crop season is required.'
      }

      const areaCultivated = Number(formData.areaCultivated)
      if (!Number.isFinite(areaCultivated) || areaCultivated <= 0) {
        nextErrors.areaCultivated = 'Area cultivated must be a positive number.'
      }

      if (formData.soilType.trim().length < 2) {
        nextErrors.soilType = 'Soil type is required.'
      }
    }

    if (step === 2 || step === 3) {
      const previousYield = Number(formData.previousYield)
      const currentYield = Number(formData.currentYield)

      if (!Number.isFinite(previousYield) || previousYield < 0) {
        nextErrors.previousYield = 'Previous yield must be zero or more.'
      }

      if (!Number.isFinite(currentYield) || currentYield < 0) {
        nextErrors.currentYield = 'Current yield must be zero or more.'
      }

      if (formData.fertilizerUsage.trim().length < 2) {
        nextErrors.fertilizerUsage = 'Fertilizer usage is required.'
      }

      if (formData.irrigationSource.trim().length < 2) {
        nextErrors.irrigationSource = 'Irrigation source is required.'
      }
    }

    if (step === 3) {
      const pestIncidents = Number(formData.pestIncidents)
      const annualFarmIncome = Number(formData.annualFarmIncome)

      if (!Number.isInteger(pestIncidents) || pestIncidents < 0) {
        nextErrors.pestIncidents = 'Pest incidents must be a whole number of zero or more.'
      }

      if (!Number.isFinite(annualFarmIncome) || annualFarmIncome < 0) {
        nextErrors.annualFarmIncome = 'Annual farm income must be zero or more.'
      }
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((step) => Math.min(step + 1, 3))
    } else {
      setNoticeType('error')
      setNotice('Please complete the required fields before continuing.')
    }
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }

  const resetForm = () => {
    setFormMode('create')
    setFormData(initialFormState)
    setErrors(initialErrors)
    setSelectedRecord(null)
    setCurrentStep(1)
    setNotice('Ready to create a new farm record.')
    setNoticeType('success')
  }

  const fillFormForEdit = (record) => {
    setFormMode('edit')
    setSelectedRecord(record)
    setCurrentStep(1)
    setFormData({
      cropName: record.cropName,
      cropSeason: record.cropSeason,
      areaCultivated: String(record.areaCultivated),
      soilType: record.soilType,
      previousYield: String(record.previousYield),
      currentYield: String(record.currentYield),
      fertilizerUsage: record.fertilizerUsage,
      irrigationSource: record.irrigationSource,
      pestIncidents: String(record.pestIncidents),
      annualFarmIncome: String(record.annualFarmIncome),
    })
    setErrors(initialErrors)
    setNotice('Edit mode enabled for the selected farm record.')
    setNoticeType('success')
  }

  const viewRecord = async (recordId) => {
    setLoadingRecord(true)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farm-records/${recordId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load the selected record.')
      }

      setSelectedRecord(data)
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setLoadingRecord(false)
    }
  }

  const submitRecord = async (event) => {
    event.preventDefault()

    if (!validateStep(3)) {
      setNoticeType('error')
      setNotice('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    setNotice('')

    const payload = {
      cropName: formData.cropName.trim(),
      cropSeason: formData.cropSeason.trim(),
      areaCultivated: Number(formData.areaCultivated),
      soilType: formData.soilType.trim(),
      previousYield: Number(formData.previousYield),
      currentYield: Number(formData.currentYield),
      fertilizerUsage: formData.fertilizerUsage.trim(),
      irrigationSource: formData.irrigationSource.trim(),
      pestIncidents: Number(formData.pestIncidents),
      annualFarmIncome: Number(formData.annualFarmIncome),
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/farm-records${formMode === 'edit' && selectedRecord ? `/${selectedRecord.id}` : ''}`,
        {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to save farm record.')
      }

      setNoticeType('success')
      setNotice(formMode === 'edit' ? 'Farm record updated successfully.' : 'Farm record created successfully.')
      setSelectedRecord(data)
      setFormData(initialFormState)
      setFormMode('create')
      setCurrentStep(1)
      await loadRecords()
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteRecord = async (record) => {
    const shouldDelete = window.confirm(`Delete record for ${record.cropName}? This cannot be undone.`)
    if (!shouldDelete) return

    setDeletingId(record.id)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farm-records/${record.id}`, {
        method: 'DELETE',
      })

      if (response.status !== 204) {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'Unable to delete farm record.')
        }
      }

      setNoticeType('success')
      setNotice('Farm record deleted successfully.')
      if (selectedRecord?.id === record.id) {
        setSelectedRecord(null)
      }
      await loadRecords()
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="min-h-screen bg-[#04141f] text-slate-100">
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
                <p className="text-sm text-slate-300">Farm data collection module</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[480px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Records</p>
                <p className="mt-1 text-2xl font-semibold text-white">{records.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Step</p>
                <p className="mt-1 text-2xl font-semibold text-white">{currentStep}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                  <Leaf className="h-4 w-4" />
                  Multi-step record entry for farm data
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Capture farm data with a clean, responsive workflow.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    Collect crop and income details, save records to MongoDB, edit updates as fields
                    change, and review all farm analytics from one dashboard.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Multi-step form navigation',
                    'Form validation on every step',
                    'Create, update, view, and delete records',
                    'Responsive dashboard cards',
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

                {notice && (
                  <div
                    className={`rounded-2xl border px-4 py-4 text-sm ${
                      noticeType === 'success'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                        : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                    }`}
                  >
                    {notice}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    New Record
                  </button>
                  <button
                    type="button"
                    onClick={loadRecords}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]"
                  >
                    <LineChart className="h-4 w-4" />
                    Refresh Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedRecord && fillFormForEdit(selectedRecord)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedRecord}
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Selected
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <form
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6"
                  onSubmit={submitRecord}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                        {formMode === 'edit' ? 'Edit record' : 'Create record'}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Farm record form</h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Step {currentStep} of {steps.length}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {steps.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          currentStep === step.id
                            ? 'bg-white text-slate-950'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {step.title}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {currentStep === 1 && (
                      <>
                        <Field label="Crop Name" error={errors.cropName} icon={Wheat}>
                          <input
                            value={formData.cropName}
                            onChange={(event) => updateField('cropName', event.target.value)}
                            className="input-field"
                            placeholder="Enter crop name"
                          />
                        </Field>

                        <Field label="Crop Season" error={errors.cropSeason} icon={Leaf}>
                          <input
                            value={formData.cropSeason}
                            onChange={(event) => updateField('cropSeason', event.target.value)}
                            className="input-field"
                            placeholder="Kharif, Rabi, Zaid"
                          />
                        </Field>

                        <Field label="Area Cultivated" error={errors.areaCultivated} icon={MapPin}>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.areaCultivated}
                            onChange={(event) => updateField('areaCultivated', event.target.value)}
                            className="input-field"
                            placeholder="Area in acres/hectares"
                          />
                        </Field>

                        <Field label="Soil Type" error={errors.soilType} icon={Building2}>
                          <input
                            value={formData.soilType}
                            onChange={(event) => updateField('soilType', event.target.value)}
                            className="input-field"
                            placeholder="Clay, loam, sandy, etc."
                          />
                        </Field>
                      </>
                    )}

                    {currentStep === 2 && (
                      <>
                        <Field label="Previous Yield" error={errors.previousYield} icon={BarChart3}>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.previousYield}
                            onChange={(event) => updateField('previousYield', event.target.value)}
                            className="input-field"
                            placeholder="Last season yield"
                          />
                        </Field>

                        <Field label="Current Yield" error={errors.currentYield} icon={BarChart3}>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.currentYield}
                            onChange={(event) => updateField('currentYield', event.target.value)}
                            className="input-field"
                            placeholder="Current season yield"
                          />
                        </Field>

                        <Field label="Fertilizer Usage" error={errors.fertilizerUsage} icon={CircleDollarSign}>
                          <input
                            value={formData.fertilizerUsage}
                            onChange={(event) => updateField('fertilizerUsage', event.target.value)}
                            className="input-field"
                            placeholder="Type or amount used"
                          />
                        </Field>

                        <Field label="Irrigation Source" error={errors.irrigationSource} icon={Building2}>
                          <input
                            value={formData.irrigationSource}
                            onChange={(event) => updateField('irrigationSource', event.target.value)}
                            className="input-field"
                            placeholder="Canal, borewell, rainfed, etc."
                          />
                        </Field>
                      </>
                    )}

                    {currentStep === 3 && (
                      <>
                        <Field label="Pest Incidents" error={errors.pestIncidents} icon={ShieldCheck}>
                          <input
                            type="number"
                            value={formData.pestIncidents}
                            onChange={(event) => updateField('pestIncidents', event.target.value)}
                            className="input-field"
                            placeholder="0"
                          />
                        </Field>

                        <Field label="Annual Farm Income" error={errors.annualFarmIncome} icon={LineChart}>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.annualFarmIncome}
                            onChange={(event) => updateField('annualFarmIncome', event.target.value)}
                            className="input-field"
                            placeholder="Total annual income"
                          />
                        </Field>

                        <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm font-semibold text-white">Review Summary</p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {[
                              ['Crop', formData.cropName || 'Not set'],
                              ['Season', formData.cropSeason || 'Not set'],
                              ['Area', formData.areaCultivated || 'Not set'],
                              ['Income', formData.annualFarmIncome || 'Not set'],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Back
                      </button>
                    ) : null}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Saving Record...
                          </>
                        ) : formMode === 'edit' ? (
                          <>
                            <PencilLine className="h-4 w-4" />
                            Update Record
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            Save Record
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Selected record</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">View details</h2>
                    </div>
                    {loadingRecord ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-emerald-300" />
                    )}
                  </div>

                  {selectedRecord ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ['Crop', selectedRecord.cropName],
                        ['Season', selectedRecord.cropSeason],
                        ['Area Cultivated', selectedRecord.areaCultivated],
                        ['Soil Type', selectedRecord.soilType],
                        ['Previous Yield', selectedRecord.previousYield],
                        ['Current Yield', selectedRecord.currentYield],
                        ['Fertilizer Usage', selectedRecord.fertilizerUsage],
                        ['Irrigation Source', selectedRecord.irrigationSource],
                        ['Pest Incidents', selectedRecord.pestIncidents],
                        ['Annual Income', selectedRecord.annualFarmIncome],
                        ['Yield Change', selectedRecord.yieldChange],
                        ['Productivity Score', selectedRecord.productivityScore],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                      Select a record from the dashboard to inspect the full farm record details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Saved farm records</h2>
              </div>
              {loadingList && <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />}
            </div>

            <div className="mt-6">
              {loadingList ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-48 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
                    />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
                  No farm records yet. Use the multi-step form to create the first one.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {records.map((record) => {
                    const isSelected = selectedRecord?.id === record.id

                    return (
                      <article
                        key={record.id}
                        className={`rounded-[1.5rem] border p-5 shadow-lg shadow-black/10 transition hover:-translate-y-1 ${
                          isSelected
                            ? 'border-emerald-400/40 bg-emerald-400/10'
                            : 'border-white/10 bg-slate-950/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">{record.cropName}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {record.cropSeason} season
                            </p>
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                            {record.productivityScore}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                          <MiniStat label="Area" value={record.areaCultivated} />
                          <MiniStat label="Income" value={record.annualFarmIncome} />
                          <MiniStat label="Yield Change" value={record.yieldChange} />
                          <MiniStat label="Pests" value={record.pestIncidents} />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => viewRecord(record.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => fillFormForEdit(record)}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord(record)}
                            disabled={deletingId === record.id}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === record.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
        </main>
      </div>
    </div>
  )
}

function Field({ label, error, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon className="h-4 w-4 text-emerald-300" />
        {label}
      </span>
      {children}
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </label>
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

export default App

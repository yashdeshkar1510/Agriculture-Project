import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  Landmark,
  LoaderCircle,
  MapPin,
  PencilLine,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Wheat,
  LandPlot,
} from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const initialFormState = {
  farmerName: '',
  age: '',
  gender: 'Male',
  aadhaarNumber: '',
  mobileNumber: '',
  state: '',
  district: '',
  village: '',
  totalLandHolding: '',
  irrigationAvailability: 'Available',
  farmingExperience: '',
}

const initialErrors = {
  farmerName: '',
  age: '',
  gender: '',
  aadhaarNumber: '',
  mobileNumber: '',
  state: '',
  district: '',
  village: '',
  totalLandHolding: '',
  irrigationAvailability: '',
  farmingExperience: '',
}

const genderOptions = ['Male', 'Female', 'Other']
const irrigationOptions = ['Available', 'Partial', 'Not Available']

function App() {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState(initialErrors)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('idle')

  const totalLand = useMemo(
    () => profiles.reduce((sum, profile) => sum + Number(profile.totalLandHolding || 0), 0),
    [profiles],
  )

  const averageAge = useMemo(() => {
    if (!profiles.length) return 0
    const sum = profiles.reduce((accumulator, profile) => accumulator + Number(profile.age || 0), 0)
    return Math.round(sum / profiles.length)
  }, [profiles])

  const loadProfiles = async () => {
    setLoadingList(true)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farmers`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load farmer profiles.')
      }

      setProfiles(data)
      setSelectedProfile((currentSelected) => {
        if (currentSelected && data.some((profile) => profile.id === currentSelected.id)) {
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
    void Promise.resolve().then(() => loadProfiles())
  }, [])

  const validate = () => {
    const nextErrors = { ...initialErrors }

    if (formData.farmerName.trim().length < 3) {
      nextErrors.farmerName = 'Farmer name is required.'
    }

    const age = Number(formData.age)
    if (!Number.isInteger(age) || age < 18 || age > 100) {
      nextErrors.age = 'Age must be an integer between 18 and 100.'
    }

    if (!formData.gender) {
      nextErrors.gender = 'Select a gender.'
    }

    if (!/^\d{12}$/.test(formData.aadhaarNumber.trim())) {
      nextErrors.aadhaarNumber = 'Aadhaar number must contain exactly 12 digits.'
    }

    if (!/^\d{7,15}$/.test(formData.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Mobile number must contain 7 to 15 digits.'
    }

    if (formData.state.trim().length < 2) {
      nextErrors.state = 'State is required.'
    }

    if (formData.district.trim().length < 2) {
      nextErrors.district = 'District is required.'
    }

    if (formData.village.trim().length < 2) {
      nextErrors.village = 'Village is required.'
    }

    const landHolding = Number(formData.totalLandHolding)
    if (!Number.isFinite(landHolding) || landHolding <= 0) {
      nextErrors.totalLandHolding = 'Total land holding must be a positive number.'
    }

    if (!formData.irrigationAvailability) {
      nextErrors.irrigationAvailability = 'Select irrigation availability.'
    }

    const experience = Number(formData.farmingExperience)
    if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
      nextErrors.farmingExperience = 'Farming experience must be a whole number between 0 and 80.'
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setNotice('')
  }

  const resetForm = () => {
    setFormMode('create')
    setFormData(initialFormState)
    setErrors(initialErrors)
    setSelectedProfile(null)
    setNotice('Ready to create a new farmer profile.')
    setNoticeType('success')
  }

  const fillFormForEdit = (profile) => {
    setFormMode('edit')
    setSelectedProfile(profile)
    setFormData({
      farmerName: profile.farmerName,
      age: String(profile.age),
      gender: profile.gender,
      aadhaarNumber: profile.aadhaarNumber,
      mobileNumber: profile.mobileNumber,
      state: profile.state,
      district: profile.district,
      village: profile.village,
      totalLandHolding: String(profile.totalLandHolding),
      irrigationAvailability: profile.irrigationAvailability,
      farmingExperience: String(profile.farmingExperience),
    })
    setErrors(initialErrors)
    setNotice('Edit mode enabled for the selected farmer profile.')
    setNoticeType('success')
  }

  const openProfile = async (profileId) => {
    setLoadingProfile(true)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farmers/${profileId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load the selected profile.')
      }

      setSelectedProfile(data)
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setLoadingProfile(false)
    }
  }

  const submitProfile = async (event) => {
    event.preventDefault()

    if (!validate()) {
      setNoticeType('error')
      setNotice('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    setNotice('')

    const payload = {
      farmerName: formData.farmerName.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      aadhaarNumber: formData.aadhaarNumber.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      state: formData.state.trim(),
      district: formData.district.trim(),
      village: formData.village.trim(),
      totalLandHolding: Number(formData.totalLandHolding),
      irrigationAvailability: formData.irrigationAvailability,
      farmingExperience: Number(formData.farmingExperience),
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/farmers${formMode === 'edit' && selectedProfile ? `/${selectedProfile.id}` : ''}`,
        {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to save farmer profile.')
      }

      setNoticeType('success')
      setNotice(
        formMode === 'edit'
          ? 'Farmer profile updated successfully.'
          : 'Farmer profile created successfully.',
      )
      setSelectedProfile(data)
      setFormData(initialFormState)
      setFormMode('create')
      await loadProfiles()
    } catch (error) {
      setNoticeType('error')
      setNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProfile = async (profile) => {
    const shouldDelete = window.confirm(
      `Delete profile for ${profile.farmerName}? This cannot be undone.`,
    )
    if (!shouldDelete) return

    setDeletingId(profile.id)
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/farmers/${profile.id}`, {
        method: 'DELETE',
      })

      if (response.status !== 204) {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'Unable to delete profile.')
        }
      }

      setNoticeType('success')
      setNotice('Farmer profile deleted successfully.')
      if (selectedProfile?.id === profile.id) {
        setSelectedProfile(null)
      }
      await loadProfiles()
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
                <p className="text-sm text-slate-300">Farmer profile management</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profiles</p>
                <p className="mt-1 text-2xl font-semibold text-white">{profiles.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg age</p>
                <p className="mt-1 text-2xl font-semibold text-white">{averageAge || '0'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total land</p>
                <p className="mt-1 text-2xl font-semibold text-white">{totalLand.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                  <Wheat className="h-4 w-4" />
                  Create, edit, view, and delete farmer records
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Farmer profile records with responsive CRUD controls.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    Manage Aadhaar-backed farmer profiles, keep field data current, and review all
                    records from one mobile-friendly interface.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Responsive form UI',
                    'Loading and error states',
                    'MongoDB-backed CRUD API',
                    'Fast edit and delete actions',
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

                <div className="grid gap-4 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    New Profile
                  </button>
                  <button
                    type="button"
                    onClick={loadProfiles}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]"
                  >
                    <Landmark className="h-4 w-4" />
                    Refresh List
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedProfile && fillFormForEdit(selectedProfile)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedProfile}
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Selected
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <form
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6"
                  onSubmit={submitProfile}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                        {formMode === 'edit' ? 'Edit profile' : 'Create profile'}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">
                        Farmer information form
                      </h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {formMode === 'edit' ? 'Updating' : 'Creating'}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Farmer Name" error={errors.farmerName} icon={UserRound}>
                      <input
                        value={formData.farmerName}
                        onChange={(event) => updateField('farmerName', event.target.value)}
                        className="input-field"
                        placeholder="Enter farmer name"
                      />
                    </Field>

                    <Field label="Age" error={errors.age} icon={ShieldCheck}>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(event) => updateField('age', event.target.value)}
                        className="input-field"
                        placeholder="18"
                      />
                    </Field>

                    <Field label="Gender" error={errors.gender} icon={UserRound}>
                      <select
                        value={formData.gender}
                        onChange={(event) => updateField('gender', event.target.value)}
                        className="input-field"
                      >
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Aadhaar Number" error={errors.aadhaarNumber} icon={Landmark}>
                      <input
                        value={formData.aadhaarNumber}
                        onChange={(event) => updateField('aadhaarNumber', event.target.value)}
                        className="input-field"
                        placeholder="12-digit Aadhaar"
                      />
                    </Field>

                    <Field label="Mobile Number" error={errors.mobileNumber} icon={Phone}>
                      <input
                        value={formData.mobileNumber}
                        onChange={(event) => updateField('mobileNumber', event.target.value)}
                        className="input-field"
                        placeholder="Mobile number"
                      />
                    </Field>

                    <Field label="State" error={errors.state} icon={MapPin}>
                      <input
                        value={formData.state}
                        onChange={(event) => updateField('state', event.target.value)}
                        className="input-field"
                        placeholder="State"
                      />
                    </Field>

                    <Field label="District" error={errors.district} icon={MapPin}>
                      <input
                        value={formData.district}
                        onChange={(event) => updateField('district', event.target.value)}
                        className="input-field"
                        placeholder="District"
                      />
                    </Field>

                    <Field label="Village" error={errors.village} icon={MapPin}>
                      <input
                        value={formData.village}
                        onChange={(event) => updateField('village', event.target.value)}
                        className="input-field"
                        placeholder="Village"
                      />
                    </Field>

                    <Field
                      label="Total Land Holding"
                      error={errors.totalLandHolding}
                      icon={LandPlot}
                    >
                      <input
                        type="number"
                        step="0.1"
                        value={formData.totalLandHolding}
                        onChange={(event) => updateField('totalLandHolding', event.target.value)}
                        className="input-field"
                        placeholder="Acres or hectares"
                      />
                    </Field>

                    <Field
                      label="Irrigation Availability"
                      error={errors.irrigationAvailability}
                      icon={Building2}
                    >
                      <select
                        value={formData.irrigationAvailability}
                        onChange={(event) =>
                          updateField('irrigationAvailability', event.target.value)
                        }
                        className="input-field"
                      >
                        {irrigationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Farming Experience"
                      error={errors.farmingExperience}
                      icon={Wheat}
                    >
                      <input
                        type="number"
                        value={formData.farmingExperience}
                        onChange={(event) => updateField('farmingExperience', event.target.value)}
                        className="input-field"
                        placeholder="Years"
                      />
                    </Field>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : formMode === 'edit' ? (
                      <>
                        <PencilLine className="h-4 w-4" />
                        Update Profile
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Create Profile
                      </>
                    )}
                  </button>
                </form>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/15 sm:p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                        Selected profile
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">View details</h2>
                    </div>
                    {loadingProfile ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-emerald-300" />
                    )}
                  </div>

                  {selectedProfile ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ['Farmer', selectedProfile.farmerName],
                        ['Age', selectedProfile.age],
                        ['Gender', selectedProfile.gender],
                        ['Aadhaar', selectedProfile.aadhaarNumber],
                        ['Mobile', selectedProfile.mobileNumber],
                        ['State', selectedProfile.state],
                        ['District', selectedProfile.district],
                        ['Village', selectedProfile.village],
                        ['Land Holding', selectedProfile.totalLandHolding],
                        ['Irrigation', selectedProfile.irrigationAvailability],
                        ['Experience', `${selectedProfile.farmingExperience} years`],
                        ['Updated', new Date(selectedProfile.updatedAt).toLocaleString()],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                      Select a record from the list to view the full farmer profile.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Farmer records</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Stored profiles</h2>
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
              ) : profiles.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
                  No farmer profiles found. Create the first profile to begin.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => {
                    const isSelected = selectedProfile?.id === profile.id

                    return (
                      <article
                        key={profile.id}
                        className={`rounded-[1.5rem] border p-5 shadow-lg shadow-black/10 transition hover:-translate-y-1 ${
                          isSelected
                            ? 'border-emerald-400/40 bg-emerald-400/10'
                            : 'border-white/10 bg-slate-950/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">{profile.farmerName}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {profile.district}, {profile.state}
                            </p>
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                            {profile.gender}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                          <MiniStat label="Age" value={profile.age} />
                          <MiniStat label="Experience" value={`${profile.farmingExperience} yrs`} />
                          <MiniStat label="Land" value={profile.totalLandHolding} />
                          <MiniStat label="Irrigation" value={profile.irrigationAvailability} />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openProfile(profile.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => fillFormForEdit(profile)}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProfile(profile)}
                            disabled={deletingId === profile.id}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === profile.id ? (
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

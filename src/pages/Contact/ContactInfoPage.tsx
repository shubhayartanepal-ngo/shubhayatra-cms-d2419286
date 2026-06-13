import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AlertBox from '../../components/common/AlertBox'
import Button from '../../components/ui/button/Button'
import contactService, { type ContactInfoPayload } from '../../services/contactService'

const defaultFormState: ContactInfoPayload = {
  location: '',
  email: '',
  phoneNumber: '',
  mapUrl: '',
  version: 0,
}

function ContactInfoPage() {
  const [formState, setFormState] = useState<ContactInfoPayload>(defaultFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    void contactService
      .getContactInfo()
      .then((contactInfo) => {
        setFormState({
          location: contactInfo.location ?? '',
          email: contactInfo.email ?? '',
          phoneNumber: contactInfo.phoneNumber ?? '',
          mapUrl: contactInfo.mapUrl ?? '',
          version: contactInfo.version ?? 0,
        })
      })
      .catch(() => {
        setError('Unable to load contact information.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const updateField = <K extends keyof ContactInfoPayload>(
    field: K,
    value: ContactInfoPayload[K]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formState.location.trim() || !formState.email.trim() || !formState.phoneNumber.trim()) {
      setError('Location, email, and phone number are required.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const saved = await contactService.saveContactInfo({
        location: formState.location.trim(),
        email: formState.email.trim(),
        phoneNumber: formState.phoneNumber.trim(),
        mapUrl: formState.mapUrl.trim(),
        version: formState.version,
      })

      setFormState({
        location: saved.location ?? '',
        email: saved.email ?? '',
        phoneNumber: saved.phoneNumber ?? '',
        mapUrl: saved.mapUrl ?? '',
        version: saved.version ?? formState.version,
      })
      toast.success('Contact information saved')
    } catch {
      setError('Unable to save contact information.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Contact Info</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage public contact details shown on the website.
        </p>
      </header>

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading contact information...</div>
      ) : (
        <form
          className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <AlertBox message={error} type="error" />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Location</span>
            <input
              value={formState.location}
              onChange={(event) => updateField('location', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="Butwal, Nepal"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                placeholder="info@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone Number</span>
              <input
                value={formState.phoneNumber}
                onChange={(event) => updateField('phoneNumber', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                placeholder="+9779800000000"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Map URL</span>
            <input
              value={formState.mapUrl}
              onChange={(event) => updateField('mapUrl', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="https://maps.google.com/..."
            />
          </label>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">Version: {formState.version}</div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Contact Info'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ContactInfoPage

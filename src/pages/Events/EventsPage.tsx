import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AlertBox from '../../components/common/AlertBox'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/button/Button'
import Modal from '../../components/ui/modal/Modal'
import { errorHandler } from '../../common/errorHandler'
import eventService, {
  getEventBannerUrl,
  type EventPayload,
  type EventRecord,
} from '../../services/eventService'

type EventFormState = {
  title: string
  eventDate: string
  location: string
  description: string
  banner: File | null
}

const emptyFormState = (): EventFormState => ({
  title: '',
  eventDate: '',
  location: '',
  description: '',
  banner: null,
})

const toFormState = (event?: EventRecord | null): EventFormState => ({
  title: event?.title ?? '',
  eventDate: event?.eventDate ?? '',
  location: event?.location ?? '',
  description: event?.description ?? '',
  banner: null,
})

const formatDate = (date: string) => {
  if (!date) return 'Date not set'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [formState, setFormState] = useState<EventFormState>(emptyFormState())
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId]
  )

  const loadEvents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const list = await eventService.listEvents()
      setEvents(list)
      setSelectedId((current) => {
        if (list.length === 0) return null
        if (current === null || !list.some((event) => event.id === current)) return list[0].id
        return current
      })
    } catch (loadError) {
      setError(errorHandler(loadError))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview)
      }
    }
  }, [bannerPreview])

  const openCreateModal = () => {
    setEditingEvent(null)
    setFormState(emptyFormState())
    setFormError(null)
    setBannerPreview(null)
    setIsModalOpen(true)
  }

  const openEditModal = (event: EventRecord) => {
    setEditingEvent(event)
    setFormState(toFormState(event))
    setFormError(null)
    setBannerPreview(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingEvent(null)
    setFormState(emptyFormState())
    setFormError(null)
    setBannerPreview(null)
  }

  const updateField = <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleBannerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview)
    }

    updateField('banner', file)
    setBannerPreview(file ? URL.createObjectURL(file) : null)
    event.target.value = ''
  }

  const buildUpdatePayload = (): EventPayload => {
    if (!editingEvent) {
      return formState
    }

    const payload: EventPayload = {}
    if (formState.title.trim() !== editingEvent.title) payload.title = formState.title.trim()
    if (formState.eventDate !== editingEvent.eventDate) payload.eventDate = formState.eventDate
    if (formState.location.trim() !== editingEvent.location) payload.location = formState.location.trim()
    if (formState.description.trim() !== editingEvent.description) {
      payload.description = formState.description.trim()
    }
    if (formState.banner) payload.banner = formState.banner

    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingEvent) {
      if (
        !formState.title.trim() ||
        !formState.eventDate ||
        !formState.location.trim() ||
        !formState.description.trim()
      ) {
        setFormError('Title, event date, location, and description are required.')
        return
      }
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (editingEvent) {
        const payload = buildUpdatePayload()
        if (Object.keys(payload).length === 0) {
          closeModal()
          return
        }
        await eventService.updateEvent(editingEvent.id, payload)
        toast.success('Event updated')
      } else {
        await eventService.createEvent({
          title: formState.title.trim(),
          eventDate: formState.eventDate,
          location: formState.location.trim(),
          description: formState.description.trim(),
          banner: formState.banner,
        })
        toast.success('Event created')
      }

      closeModal()
      await loadEvents()
    } catch (saveError) {
      setFormError(errorHandler(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await eventService.deleteEvent(deleteTarget.id)
      toast.success('Event deleted')
      setDeleteTarget(null)
      await loadEvents()
    } catch (deleteError) {
      toast.error(errorHandler(deleteError))
    } finally {
      setIsDeleting(false)
    }
  }

  const activeBannerUrl = bannerPreview || getEventBannerUrl(editingEvent?.bannerPath)

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Upcoming Events</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create, update, and manage upcoming public events.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal} startIcon={<Plus size={14} />}>
          Create Event
        </Button>
      </header>

      {error ? <AlertBox message={error} type="error" /> : null}

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading events...</div>
      ) : events.length === 0 ? (
        <EmptyState
          message="No upcoming events yet. Create an event to get started."
          action={{ label: 'Create Event', onClick: openCreateModal }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedId(event.id)}
                className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                  event.id === selectedId
                    ? 'border-brand-red ring-2 ring-brand-red/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">{event.title}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={14} />
                  {formatDate(event.eventDate)}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={14} />
                  {event.location}
                </div>
              </button>
            ))}
          </aside>

          <main>
            {selectedEvent ? (
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {selectedEvent.bannerPath ? (
                  <img
                    src={getEventBannerUrl(selectedEvent.bannerPath)}
                    alt={selectedEvent.title}
                    className="h-64 w-full object-cover"
                  />
                ) : null}

                <div className="space-y-4 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{selectedEvent.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>{formatDate(selectedEvent.eventDate)}</span>
                        <span>{selectedEvent.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="edit"
                        onClick={() => openEditModal(selectedEvent)}
                        startIcon={<Pencil size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => setDeleteTarget(selectedEvent)}
                        startIcon={<Trash2 size={14} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedEvent.description}
                  </p>
                </div>
              </article>
            ) : (
              <div className="text-sm text-slate-500">Select an event.</div>
            )}
          </main>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        description={
          editingEvent
            ? 'Update only the fields you want to change.'
            : 'Add title, date, location, description, and an optional banner.'
        }
        onClose={closeModal}
        closeDisabled={isSaving}
      >
        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <AlertBox message={formError} type="error" />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={formState.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="Free Health Camp 2026"
              disabled={isSaving}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Event Date</span>
              <input
                type="date"
                value={formState.eventDate}
                onChange={(event) => updateField('eventDate', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                disabled={isSaving}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                value={formState.location}
                onChange={(event) => updateField('location', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                placeholder="Kathmandu, Nepal"
                disabled={isSaving}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              rows={5}
              value={formState.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="Shubhayatra Nepal is organizing a free health camp."
              disabled={isSaving}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Banner</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
              disabled={isSaving}
            />
          </label>

          {activeBannerUrl ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <img src={activeBannerUrl} alt="Event banner preview" className="h-44 w-full object-cover" />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title ?? ''}" permanently?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default EventsPage

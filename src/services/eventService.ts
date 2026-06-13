import apiClient from '../common/apiClient'
import { buildMediaUrl } from '../common/mediaUrl'

export interface EventRecord {
  id: number
  title: string
  eventDate: string
  location: string
  description: string
  bannerPath?: string | null
  createdAt?: string
}

export interface EventPayload {
  title?: string
  eventDate?: string
  location?: string
  description?: string
  banner?: File | null
}

type ApiEnvelope<T> = {
  data?: T
  message?: string
  success?: boolean
  status?: boolean
}

const unwrapData = <T>(response: { data?: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T | undefined

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

const resolveEventList = (payload: unknown): EventRecord[] => {
  if (Array.isArray(payload)) {
    return payload as EventRecord[]
  }

  if (payload && typeof payload === 'object') {
    const responseObject = payload as {
      data?: EventRecord[]
      events?: EventRecord[]
      items?: EventRecord[]
    }

    return responseObject.data || responseObject.events || responseObject.items || []
  }

  return []
}

const buildEventFormData = (payload: EventPayload): FormData => {
  const formData = new FormData()

  if (payload.title !== undefined) formData.append('title', payload.title)
  if (payload.eventDate !== undefined) formData.append('eventDate', payload.eventDate)
  if (payload.location !== undefined) formData.append('location', payload.location)
  if (payload.description !== undefined) formData.append('description', payload.description)
  if (payload.banner) formData.append('banner', payload.banner)

  return formData
}

export const getEventBannerUrl = (bannerPath?: string | null) =>
  buildMediaUrl(bannerPath, 'uploads')

const eventService = {
  listEvents: async (): Promise<EventRecord[]> => {
    const response = await apiClient.get('/v1/public/events')
    const payload = unwrapData<EventRecord[] | { data?: EventRecord[]; events?: EventRecord[]; items?: EventRecord[] }>(
      response
    )

    return resolveEventList(payload).sort((a, b) => {
      const dateA = new Date(a.eventDate || a.createdAt || '').getTime()
      const dateB = new Date(b.eventDate || b.createdAt || '').getTime()
      return (Number.isFinite(dateA) ? dateA : 0) - (Number.isFinite(dateB) ? dateB : 0)
    })
  },

  createEvent: async (payload: Required<Pick<EventPayload, 'title' | 'eventDate' | 'location' | 'description'>> & Pick<EventPayload, 'banner'>): Promise<EventRecord> => {
    const response = await apiClient.post('/v1/admin/events', buildEventFormData(payload))
    return unwrapData<EventRecord>(response)
  },

  updateEvent: async (id: string | number, payload: EventPayload): Promise<EventRecord> => {
    const response = await apiClient.put(`/v1/admin/events/${id}`, buildEventFormData(payload))
    return unwrapData<EventRecord>(response)
  },

  deleteEvent: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/events/${id}`)
  },
}

export default eventService

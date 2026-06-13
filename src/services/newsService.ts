import apiClient from '../common/apiClient'
import seedNewsData from '../data/newsData'
import { getMediaUrl } from '../common/mediaUrl'

export type NewsStatus = 'draft' | 'published' | 'archived'

export type NewsAuthor =
  | string
  | {
      id?: number
      name: string
      email?: string
    }

export type NewsMeta = {
  title?: string
  description?: string
  keywords?: string[]
}

export type NewsItem = {
  id: number
  slug: string
  image?: string[]
  images?: Array<{
    id?: number
    title?: string
    fileName?: string | null
    filePath?: string | null
    mediaType?: string
    contentType?: string
    uploadedAt?: string
  }>
  title: string
  header?: string
  summary?: string
  description?: string
  content?: string
  date?: string
  status: NewsStatus
  tags?: string[]
  categories?: string[]
  author?: NewsAuthor
  meta?: NewsMeta
  created_at?: string
  updated_at?: string
}

export type NewsPayload = {
  title: string
  slug?: string
  summary?: string
  content?: string
  image?: string[]
  date?: string
  status?: NewsStatus
  tags?: string[]
  categories?: string[]
  author?: NewsAuthor
  meta?: NewsMeta
}

const STORAGE_KEY = 'shubhayatra_news_crud_v1'

type StoredNewsItem = Partial<NewsItem> & { id: number; title: string }
type ApiNewsItem = StoredNewsItem & {
  imageUrls?: string[]
  createdAt?: string
  updatedAt?: string
}

const cloneSeed = (): NewsItem[] =>
  seedNewsData.map((item) => normalizeNewsItem(item as StoredNewsItem))

const sortById = (items: NewsItem[]) => [...items].sort((a, b) => b.id - a.id)

const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const normalizeStringList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }

  const values = value.map((entry) => asTrimmedString(entry)).filter(Boolean) as string[]
  return values.length > 0 ? values : undefined
}

const slugify = (value: string, fallback: string) => {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

const normalizeAuthor = (value: unknown): NewsAuthor | undefined => {
  if (typeof value === 'string') {
    return asTrimmedString(value)
  }

  if (!value || typeof value !== 'object') {
    return undefined
  }

  const author = value as { id?: unknown; name?: unknown; email?: unknown }
  const name = asTrimmedString(author.name)

  if (!name) {
    return undefined
  }

  const normalized: { id?: number; name: string; email?: string } = { name }

  if (typeof author.id === 'number' && Number.isFinite(author.id)) {
    normalized.id = author.id
  }

  const email = asTrimmedString(author.email)
  if (email) {
    normalized.email = email
  }

  return normalized
}

const normalizeMeta = (value: unknown): NewsMeta | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const meta = value as { title?: unknown; description?: unknown; keywords?: unknown }
  const title = asTrimmedString(meta.title)
  const description = asTrimmedString(meta.description)
  const keywords = normalizeStringList(meta.keywords)

  if (!title && !description && !keywords) {
    return undefined
  }

  return {
    title,
    description,
    keywords,
  }
}

const normalizeNewsItem = (
  item: ApiNewsItem,
  defaults?: { createdAt?: string; updatedAt?: string }
): NewsItem => {
  const header = asTrimmedString(item.header)
  const title = asTrimmedString(item.title) || header || 'Untitled News'
  const slug = asTrimmedString(item.slug)
  const description = asTrimmedString(item.description)

  return {
    id: item.id,
    slug: slugify(slug || title, `news-${item.id}`),
    title,
    header,
    summary: asTrimmedString(item.summary) || description,
    description,
    content: asTrimmedString(item.content) || description,
    image: (() => {
      const imageSource = item.image ?? item.imageUrls ?? item.images
      if (!imageSource) return undefined

      const toUrl = (entry: unknown) => {
        if (typeof entry === 'string') {
          const trimmed = asTrimmedString(entry)
          return trimmed ? getMediaUrl(trimmed) : undefined
        }
        if (entry && typeof entry === 'object') {
          const imageEntry = entry as { filePath?: unknown; fileName?: unknown }
          const filePath =
            asTrimmedString(imageEntry.filePath) || asTrimmedString(imageEntry.fileName)
          if (filePath) {
            return getMediaUrl(filePath)
          }
        }
        return undefined
      }

      if (Array.isArray(imageSource)) {
        return imageSource.map(toUrl).filter(Boolean) as string[]
      }

      return undefined
    })(),
    date: asTrimmedString(item.date),
    status: item.status === 'published' || item.status === 'archived' ? item.status : 'draft',
    tags: normalizeStringList(item.tags),
    categories: normalizeStringList(item.categories),
    author: normalizeAuthor(item.author),
    meta: normalizeMeta(item.meta),
    created_at: asTrimmedString(item.created_at) || asTrimmedString(item.createdAt) || defaults?.createdAt,
    updated_at: asTrimmedString(item.updated_at) || asTrimmedString(item.updatedAt) || defaults?.updatedAt,
  }
}

const parseStoredItems = (raw: string | null): NewsItem[] | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return null
    }

    return parsed
      .map((entry) => entry as StoredNewsItem)
      .filter((entry) => typeof entry?.id === 'number' && typeof entry?.title === 'string')
      .map((entry) => normalizeNewsItem(entry))
  } catch {
    return null
  }
}

const readNews = (): NewsItem[] => {
  if (typeof window === 'undefined') {
    return sortById(cloneSeed())
  }

  const stored = parseStoredItems(window.localStorage.getItem(STORAGE_KEY))
  return sortById(stored ?? cloneSeed())
}

const writeNews = (items: NewsItem[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortById(items)))
}

const nextId = (items: NewsItem[]) =>
  items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1

const cleanPayload = (payload: NewsPayload): StoredNewsItem => {
  const author = normalizeAuthor(payload.author)
  return {
    id: 0,
    title: payload.title,
    ...(payload.slug ? { slug: payload.slug } : {}),
    ...(payload.summary ? { summary: payload.summary } : {}),
    ...(payload.content ? { content: payload.content } : {}),
    ...(payload.image ? { image: payload.image } : {}),
    ...(payload.date ? { date: payload.date } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.tags ? { tags: payload.tags } : {}),
    ...(payload.categories ? { categories: payload.categories } : {}),
    ...(author ? { author } : {}),
    ...(payload.meta ? { meta: payload.meta } : {}),
  }
}

const buildNewsFormData = (payload: NewsPayload): FormData => {
  const form = new FormData()
  form.append('header', payload.title)
  form.append('description', payload.content || payload.summary || '')
  form.append('context', 'news')
  if (payload.status) form.append('status', payload.status)
  if (payload.tags) form.append('tags', JSON.stringify(payload.tags))
  if (payload.categories) form.append('categories', JSON.stringify(payload.categories))
  if (payload.author)
    form.append(
      'author',
      typeof payload.author === 'string' ? payload.author : JSON.stringify(payload.author)
    )

  const dataUrls = Array.isArray(payload.image) ? (payload.image as string[]) : []
  dataUrls.forEach((d: string, idx: number) => {
    if (typeof d === 'string' && d.startsWith('data:')) {
      const blob = dataURLToBlob(d)
      form.append('files', blob, `image-${Date.now()}-${idx}.png`)
    }
  })

  return form
}

const VITE_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
const VITE_API_IMAGE = (import.meta as any).env?.VITE_API_IMAGE_URL as string | undefined

const API_ROOT = VITE_API_BASE ? VITE_API_BASE.replace(/\/$/, '') : ''
const API_BASE = API_ROOT ? `${API_ROOT}/news` : '/api/news'
export const API_IMAGE_BASE = VITE_API_IMAGE ?? '/'

let API_ENABLED = Boolean(API_ROOT)

export const setApiEnabled = (enabled: boolean) => {
  API_ENABLED = enabled
}

export const testApiConnection = async (): Promise<boolean> => {
  if (!API_ENABLED) return false
  try {
    const res = await fetch(API_BASE, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

const newsService = {
  list: async (): Promise<NewsItem[]> => {
    if (API_ENABLED) {
      try {
        const res = await apiClient.get('/v1/public/news')
        const data = res.data as unknown
        if (!Array.isArray(data)) return sortById(cloneSeed())
        return sortById((data as StoredNewsItem[]).map((d) => normalizeNewsItem(d)))
      } catch {
        // fallthrough to local
      }
    }

    try {
      const res = await fetch(API_BASE)
      if (!res.ok) {
        // fallback to local seed
        return sortById(cloneSeed())
      }
      const data = (await res.json()) as unknown
      if (!Array.isArray(data)) return sortById(cloneSeed())
      return sortById((data as StoredNewsItem[]).map((d) => normalizeNewsItem(d)))
    } catch {
      return sortById(cloneSeed())
    }
  },

  findById: async (id: number): Promise<NewsItem | undefined> => {
    if (API_ENABLED) {
      try {
        // Backend does not support GET /news/{id}, so fetch the list and find the item
        const res = await apiClient.get('/v1/public/news')
        const data = res.data as unknown
        const items = !Array.isArray(data) ? [] : (data as StoredNewsItem[])
        const found = items.find((item) => item.id === id)
        return found ? normalizeNewsItem(found) : undefined
      } catch {
        // fallthrough
      }
    }

    try {
      const res = await fetch(API_BASE)
      if (!res.ok) return undefined
      const data = (await res.json()) as unknown
      const items = !Array.isArray(data) ? [] : (data as StoredNewsItem[])
      const found = items.find((item) => item.id === id)
      return found ? normalizeNewsItem(found) : undefined
    } catch {
      return readNews().find((item) => item.id === id)
    }
  },

  create: async (payload: NewsPayload | FormData): Promise<NewsItem> => {
    if (API_ENABLED) {
      try {
        // If caller provided a FormData, forward it directly
        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
          const res = await apiClient.post('/v1/admin/news', payload)
          const data = res.data as StoredNewsItem
          return normalizeNewsItem(data)
        }

        const dataPayload = payload as NewsPayload
        const form = buildNewsFormData(dataPayload)
        const dataUrls = Array.isArray(dataPayload.image) ? (dataPayload.image as string[]) : []
        dataUrls.forEach((d: string, idx: number) => {
          if (typeof d === 'string' && d.startsWith('data:')) {
            const blob = dataURLToBlob(d)
            form.append('files', blob, `image-${Date.now()}-${idx}.png`)
          }
        })

        const res = await apiClient.post('/v1/admin/news', form)
        const data = res.data as StoredNewsItem
        return normalizeNewsItem(data)
      } catch {
        // fall through to local-only persistence instead of retrying as JSON
      }
    }

    const items = readNews()
    const createdAt = new Date().toISOString()
    const raw = { ...cleanPayload(payload as NewsPayload), id: nextId(items) } as StoredNewsItem
    const newsItem: NewsItem = normalizeNewsItem(raw, { createdAt, updatedAt: createdAt })
    const nextItems = sortById([newsItem, ...items])
    writeNews(nextItems)
    return newsItem
  },

  update: async (id: number, payload: NewsPayload | FormData): Promise<NewsItem | null> => {
    if (API_ENABLED) {
      try {
        // Directly forward FormData when provided
        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
          const res = await apiClient.put(`/v1/admin/news/${id}`, payload)
          const data = res.data as StoredNewsItem
          return normalizeNewsItem(data)
        }

        const dataPayload = payload as NewsPayload
        const form = buildNewsFormData(dataPayload)
        const res = await apiClient.put(`/v1/admin/news/${id}`, form)
        const data = res.data as StoredNewsItem
        return normalizeNewsItem(data)
      } catch {
        // fall through to local-only persistence instead of retrying as JSON
      }
    }

    const items = readNews()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return null
    const current = items[index]
    const updatedAt = new Date().toISOString()
    const updated: NewsItem = normalizeNewsItem(
      { ...current, ...cleanPayload(payload as NewsPayload), created_at: current.created_at },
      { createdAt: current.created_at, updatedAt }
    )
    items[index] = updated
    writeNews(items)
    return updated
  },

  remove: async (id: number): Promise<boolean> => {
    if (API_ENABLED) {
      try {
        const res = await apiClient.delete(`/v1/admin/news/${id}`)
        if (res.status >= 200 && res.status < 300) return true
        // fallback to local
      } catch {
        // ignore
      }
    }
    const items = readNews()
    const nextItems = items.filter((item) => item.id !== id)
    if (nextItems.length === items.length) return false
    writeNews(nextItems)
    return true
  },

  reset: async (): Promise<NewsItem[]> => {
    const seed = cloneSeed()
    writeNews(seed)
    return sortById(seed)
  },
}

function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const meta = parts[0]
  const base64 = parts[1]
  const matches = /data:(.*);base64/.exec(meta)
  const contentType = matches ? matches[1] : 'application/octet-stream'
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

export default newsService

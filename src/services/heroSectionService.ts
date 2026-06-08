import apiClient from '../common/apiClient'

export interface HeroSectionResponse {
  id: number | string
  language: string
  title: string
  imageUrl: string | null
  version: number
  subtitle?: string | null
  ctaText?: string | null
  ctaLink?: string | null
}

export interface HeroSectionDraftPayload {
  title: string
  subtitle?: string
  language?: string
}

export interface HeroSectionPublishPayload {
  title: string
  subtitle?: string
  imageUrl: string
  version: number
  language?: string
}

type ApiResponseDto<T> = {
  message?: string
  data?: T
  success?: boolean
}

const unwrapData = <T>(response: { data?: ApiResponseDto<T> | T }): T => {
  const payload = response.data as ApiResponseDto<T> | T | undefined

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponseDto<T>).data as T
  }

  return payload as T
}

const resolveHeroList = (payload: unknown): HeroSectionResponse[] => {
  if (Array.isArray(payload)) {
    return payload as HeroSectionResponse[]
  }

  if (payload && typeof payload === 'object') {
    const responseObject = payload as {
      data?: HeroSectionResponse[]
      items?: HeroSectionResponse[]
      heroSections?: HeroSectionResponse[]
    }

    return responseObject.data || responseObject.items || responseObject.heroSections || []
  }

  return []
}

const heroSectionService = {
  getHeroSection: async (): Promise<HeroSectionResponse | HeroSectionResponse[]> => {
    const response = await apiClient.get('/v1/admin/hero-section')

    const payload = unwrapData<HeroSectionResponse | HeroSectionResponse[]>(response)

    if (Array.isArray(payload)) {
      return resolveHeroList(payload)
    }

    return payload
  },

  saveDraft: async (payload: HeroSectionDraftPayload): Promise<HeroSectionResponse> => {
    const response = await apiClient.put('/v1/admin/hero-section/draft', payload)
    return unwrapData<HeroSectionResponse>(response)
  },

  publish: async (payload: HeroSectionPublishPayload): Promise<HeroSectionResponse> => {
    const response = await apiClient.put('/v1/admin/hero-section/publish', payload)
    return unwrapData<HeroSectionResponse>(response)
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/v1/admin/hero-section/image', formData)

    const payload = unwrapData<unknown>(response)

    if (typeof payload === 'string') {
      return payload
    }

    if (payload && typeof payload === 'object') {
      const responseObject = payload as { imageUrl?: string; url?: string }
      return responseObject.imageUrl || responseObject.url || ''
    }

    return ''
  },
}

export default heroSectionService

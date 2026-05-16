import apiClient from '../common/apiClient'

export type GalleryUploadType = 'IMAGE' | 'VIDEO'
export type GalleryMediaType = 'IMAGE' | 'VIDEO'

export interface GalleryUploadPayload {
  files: File[]
  title: string
  type: GalleryUploadType
}

export interface GalleryUploadResponse {
  message?: string
  status?: boolean
  data?: unknown
}

export interface GalleryItem {
  id: number | string
  title: string
  fileName: string
  filePath: string
  mediaType: GalleryMediaType
  contentType: string
  uploadedAt: string
}

const galleryService = {
  uploadGalleryMedia: async (payload: GalleryUploadPayload): Promise<GalleryUploadResponse> => {
    // Separate files by type
    const imageFiles = payload.files.filter((file) => file.type.startsWith('image/'))
    const videoFiles = payload.files.filter((file) => file.type.startsWith('video/'))

    const responses: GalleryUploadResponse[] = []

    // Upload images if any
    if (imageFiles.length > 0) {
      const formData = new FormData()
      imageFiles.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('title', payload.title)
      formData.append('type', 'IMAGE')

      const response = await apiClient.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      responses.push(response.data as GalleryUploadResponse)
    }

    // Upload videos if any
    if (videoFiles.length > 0) {
      const formData = new FormData()
      videoFiles.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('title', payload.title)
      formData.append('type', 'VIDEO')

      const response = await apiClient.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      responses.push(response.data as GalleryUploadResponse)
    }

    // Return combined response
    return {
      message: `Uploaded ${imageFiles.length} image(s) and ${videoFiles.length} video(s)`,
      status: true,
      data: responses,
    }
  },

  listGallery: async (): Promise<GalleryItem[]> => {
    const response = await apiClient.get('/gallery')
    const payload = response.data

    if (Array.isArray(payload)) {
      return payload as GalleryItem[]
    }

    if (payload && typeof payload === 'object') {
      const data = payload as { data?: GalleryItem[]; items?: GalleryItem[] }
      return data.data || data.items || []
    }

    return []
  },

  searchByTitle: async (title: string): Promise<GalleryItem[]> => {
    const response = await apiClient.get('/gallery/search', {
      params: { title },
    })
    const payload = response.data

    if (Array.isArray(payload)) {
      return payload as GalleryItem[]
    }

    if (payload && typeof payload === 'object') {
      const data = payload as { data?: GalleryItem[]; items?: GalleryItem[] }
      return data.data || data.items || []
    }

    return []
  },

  searchByType: async (type: GalleryMediaType): Promise<GalleryItem[]> => {
    const response = await apiClient.get('/gallery/type/search', {
      params: { type },
    })
    const payload = response.data

    if (Array.isArray(payload)) {
      return payload as GalleryItem[]
    }

    if (payload && typeof payload === 'object') {
      const data = payload as { data?: GalleryItem[]; items?: GalleryItem[] }
      return data.data || data.items || []
    }

    return []
  },

  updateTitle: async (id: string | number, newTitle: string): Promise<GalleryItem> => {
    const response = await apiClient.patch(`/gallery/${id}/title`, newTitle, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })

    return response.data as GalleryItem
  },

  deleteGalleryItem: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/gallery/${id}`)
  },
}

export default galleryService

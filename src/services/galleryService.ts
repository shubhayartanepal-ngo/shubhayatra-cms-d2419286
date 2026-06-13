import apiClient from '../common/apiClient'

export type GalleryUploadType = 'IMAGE' | 'VIDEO'
export type GalleryMediaType = 'IMAGE' | 'VIDEO'

export interface GalleryUploadPayload {
  files: File[]
  title: string
  description?: string
  type: GalleryUploadType
}

export interface GalleryCreateAlbumPayload {
  programName: string
  description?: string
}

export interface GalleryUploadResponse {
  message?: string
  status?: boolean
  data?: unknown
}

export interface GalleryItem {
  id: number | string
  albumId: number | string
  title: string
  fileName: string
  filePath: string
  mediaType: GalleryMediaType
  contentType: string
  uploadedAt: string
}

export interface Album {
  id: number | string
  programName: string
  description?: string
  mediaCount: number
  coverImage?: string
}

const normalizeMediaType = (value: unknown): GalleryMediaType => {
  if (value === 'IMAGE' || value === 'VIDEO') {
    return value
  }

  const stringValue = String(value || '').toUpperCase()
  return stringValue === 'VIDEO' ? 'VIDEO' : 'IMAGE'
}

const resolveAlbumId = (value: unknown): string | number | undefined => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const data = value as Record<string, unknown>
    return resolveAlbumId(data.id ?? data.albumId)
  }

  return undefined
}

const getFileNameFromPath = (filePath: unknown): string => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    return ''
  }

  const normalizedPath = filePath.replace(/\\/g, '/')
  return normalizedPath.split('/').pop() ?? normalizedPath
}

const parseResponseItems = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>

    if (Array.isArray(data.data)) {
      return data.data
    }

    if (Array.isArray(data.items)) {
      return data.items
    }

    if (Array.isArray(data.albums)) {
      return data.albums
    }
  }

  return []
}

const parseResponseData = <T>(payload: unknown): T | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const data = payload as Record<string, unknown>
  return (data.data ?? payload) as T
}

const normalizeAlbumMediaItems = (album: Record<string, unknown>): GalleryItem[] => {
  const albumId = resolveAlbumId(album)
  if (albumId === undefined) {
    return []
  }

  const title = String(album.programName ?? album.title ?? 'Untitled').trim() || 'Untitled'
  const media = Array.isArray(album.media)
    ? album.media
    : Array.isArray(album.mediaList)
      ? album.mediaList
      : []

  return media
    .map((mediaItem) => {
      if (!mediaItem || typeof mediaItem !== 'object') {
        return null
      }

      const item = mediaItem as Record<string, unknown>
      const id = item.id ?? item.mediaId
      const filePath = item.filePath ?? item.file_path ?? item.fileName
      const fileName = getFileNameFromPath(filePath)

      if (id === undefined || filePath === undefined) {
        return null
      }

      return {
        id,
        albumId,
        title,
        fileName,
        filePath: String(filePath),
        mediaType: normalizeMediaType(item.mediaType ?? item.media_type),
        contentType: String(item.contentType ?? item.content_type ?? ''),
        uploadedAt: String(item.uploadedAt ?? item.uploaded_at ?? ''),
      }
    })
    .filter((item): item is GalleryItem => item !== null)
}

const galleryService = {
  createAlbum: async (payload: GalleryCreateAlbumPayload): Promise<Record<string, unknown>> => {
    const params = new URLSearchParams()
    params.append('programName', payload.programName)
    if (payload.description) {
      params.append('description', payload.description)
    }

    const response = await apiClient.post('/v1/admin/albums', null, { params })
    return (
      parseResponseData<Record<string, unknown>>(response.data) ??
      (response.data as Record<string, unknown>)
    )
  },

  uploadAlbumMedia: async (
    albumId: string | number,
    files: File[],
    mediaType: GalleryMediaType
  ): Promise<GalleryUploadResponse> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('mediaType', mediaType)

    const response = await apiClient.post(`/v1/admin/albums/${albumId}/media`, formData)
    return response.data as GalleryUploadResponse
  },

  listGallery: async (): Promise<GalleryItem[]> => {
    const response = await apiClient.get('/v1/public/albums')
    const payload = response.data
    const rawAlbums = parseResponseItems(payload)

    return rawAlbums.flatMap((album) => {
      if (!album || typeof album !== 'object') {
        return []
      }

      return normalizeAlbumMediaItems(album as Record<string, unknown>)
    })
  },

  listAlbums: async (): Promise<Album[]> => {
    const response = await apiClient.get('/v1/public/albums')
    const rawAlbums = parseResponseItems(response.data)
    
    return rawAlbums.map((rawAlbum) => {
      const album = rawAlbum as Record<string, unknown>
      const id = resolveAlbumId(album) ?? ''
      const programName = String(album.programName ?? album.title ?? 'Untitled').trim() || 'Untitled'
      const description = typeof album.description === 'string' ? album.description : undefined
      const media = Array.isArray(album.media) ? album.media : Array.isArray(album.mediaList) ? album.mediaList : []
      
      let coverImage: string | undefined
      if (media.length > 0) {
        const firstMedia = media[0] as Record<string, unknown>
        coverImage = String(firstMedia.filePath ?? firstMedia.file_path ?? firstMedia.fileName ?? '')
      }

      return {
        id,
        programName,
        description,
        mediaCount: media.length,
        coverImage
      }
    })
  },

  searchByTitle: async (title: string): Promise<GalleryItem[]> => {
    const items = await galleryService.listGallery()
    const normalizedTitle = title.trim().toLowerCase()

    if (normalizedTitle === '') {
      return items
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedTitle) ||
        item.fileName.toLowerCase().includes(normalizedTitle)
      )
    })
  },

  searchByType: async (type: GalleryMediaType): Promise<GalleryItem[]> => {
    const items = await galleryService.listGallery()
    return items.filter((item) => item.mediaType === type)
  },

  getAlbumMedia: async (albumId: string | number): Promise<GalleryItem[]> => {
    const response = await apiClient.get(`/v1/public/media/${albumId}`)
    const payload = response.data
    const rawItems = parseResponseItems(payload)

    return rawItems
      .map((mediaItem) => {
        if (!mediaItem || typeof mediaItem !== 'object') {
          return null
        }

        const item = mediaItem as Record<string, unknown>
        const id = item.id ?? item.mediaId
        const filePath = item.filePath ?? item.file_path ?? item.fileName

        if (id === undefined || filePath === undefined) {
          return null
        }

        return {
          id,
          albumId,
          title: String(item.title ?? item.programName ?? 'Untitled'),
          fileName: String(item.fileName ?? item.file_name ?? ''),
          filePath: String(filePath),
          mediaType: normalizeMediaType(item.mediaType ?? item.media_type),
          contentType: String(item.contentType ?? item.content_type ?? ''),
          uploadedAt: String(item.uploadedAt ?? item.uploaded_at ?? ''),
        }
      })
      .filter((item): item is GalleryItem => item !== null)
  },

  updateAlbum: async (
    albumId: string | number,
    payload: Partial<GalleryCreateAlbumPayload>
  ): Promise<Record<string, unknown>> => {
    const params = new URLSearchParams()

    if (payload.programName) {
      params.append('programName', payload.programName)
    }
    if (payload.description) {
      params.append('description', payload.description)
    }

    const response = await apiClient.put(`/v1/admin/media/${albumId}`, null, { params })
    return (
      parseResponseData<Record<string, unknown>>(response.data) ??
      (response.data as Record<string, unknown>)
    )
  },

  deleteAlbum: async (albumId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/albums/${albumId}`)
  },

  deleteAlbumMedia: async (mediaId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/albums/media/${mediaId}`)
  },

  deleteGalleryItem: async (mediaId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/albums/media/${mediaId}`)
  },

  uploadGalleryMedia: async (payload: GalleryUploadPayload): Promise<GalleryUploadResponse> => {
    const albumResult = await galleryService.createAlbum({
      programName: payload.title,
      description: payload.description,
    })

    const albumId = resolveAlbumId(albumResult)
    if (albumId === undefined || albumId === null) {
      return {
        message: 'Unable to create album for gallery upload.',
        status: false,
      }
    }

    const imageFiles = payload.files.filter((file) => file.type.startsWith('image/'))
    const videoFiles = payload.files.filter((file) => file.type.startsWith('video/'))
    const responses: GalleryUploadResponse[] = []

    if (imageFiles.length > 0) {
      responses.push(await galleryService.uploadAlbumMedia(albumId, imageFiles, 'IMAGE'))
    }

    if (videoFiles.length > 0) {
      responses.push(await galleryService.uploadAlbumMedia(albumId, videoFiles, 'VIDEO'))
    }

    return {
      message: `Uploaded ${imageFiles.length} image(s) and ${videoFiles.length} video(s)`,
      status: true,
      data: responses,
    }
  },
}

export default galleryService

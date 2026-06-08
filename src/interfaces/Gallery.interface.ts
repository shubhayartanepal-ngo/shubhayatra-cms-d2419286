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

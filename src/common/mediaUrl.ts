const normalizeBaseUrl = (baseUrl?: string) => (baseUrl ?? '').replace(/\/$/, '')

const buildMediaUrl = (filePath?: string | null, folder = 'uploads') => {
  if (!filePath) return ''

  if (/^https?:\/\//.test(filePath)) {
    return filePath
  }

  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_IMAGE_URL)
  const normalizedPath = filePath.replace(/^\//, '')
  const mediaPath = normalizedPath.startsWith(`${folder}/`)
    ? normalizedPath
    : `${folder}/${normalizedPath}`
  return baseUrl ? `${baseUrl}/${mediaPath}` : `/${mediaPath}`
}

export const getMediaUrl = (filePath?: string | null) => buildMediaUrl(filePath, 'uploads')
export const getGalleryMediaUrl = (filePath?: string | null) => buildMediaUrl(filePath, 'uploads')
export const getNewsMediaUrl = (filePath?: string | null) => buildMediaUrl(filePath, 'news')

export { buildMediaUrl }

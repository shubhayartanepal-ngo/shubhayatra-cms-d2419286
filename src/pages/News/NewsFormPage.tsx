import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import toast from 'react-hot-toast'
import AlertBox from '../../components/common/AlertBox'
import Button from '../../components/ui/button/Button'
import newsService, { type NewsItem, type NewsPayload } from '../../services/newsService'

type NewsFormState = {
  header: string
  description: string
}

const emptyFormState = (): NewsFormState => ({
  header: '',
  description: '',
})

const toFormState = (item?: NewsItem | null): NewsFormState => ({
  header: item?.title ?? '',
  description: item?.summary ?? item?.content ?? '',
})

const toPayload = (formState: NewsFormState): NewsPayload => ({
  title: formState.header.trim(),
  summary: formState.description.trim() || undefined,
  content: formState.description.trim() || undefined,
})

const buildUploadForm = (payload: NewsPayload, files: File[]) => {
  const formData = new FormData()
  formData.append('header', payload.title)
  formData.append('description', payload.content || payload.summary || '')
  formData.append('context', 'news')
  files.forEach((file) => formData.append('files', file, file.name))
  return formData
}

export default function NewsFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editingId = id && /^[0-9]+$/.test(id) ? Number(id) : null

  const [formState, setFormState] = useState<NewsFormState>(emptyFormState())
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(editingId !== null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (editingId === null) {
      return
    }

    setIsLoading(true)
    void newsService
      .findById(editingId)
      .then((item) => {
        if (!item) {
          setFormError('News item not found')
          return
        }

        setFormState(toFormState(item))
        setExistingImages(item.image ?? [])
      })
      .catch(() => {
        setFormError('Unable to load the news item')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [editingId])

  const handleFileSelection = (files: FileList | null) => {
    const selected = Array.from(files ?? [])
    if (selected.length === 0) {
      return
    }

    const validFiles = selected.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFormError(`Image "${file.name}" must be under 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      return
    }

    setSelectedFiles(validFiles)
    setExistingImages([])
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(typeof reader.result === 'string' ? reader.result : null)
      setFormError(null)
    }
    reader.readAsDataURL(validFiles[0])
  }

  const handleSubmit = async () => {
    if (!formState.header.trim()) {
      setFormError('Header is required')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const payload = toPayload(formState)
      const result = selectedFiles.length > 0
        ? editingId !== null
          ? await newsService.update(editingId, buildUploadForm(payload, selectedFiles))
          : await newsService.create(buildUploadForm(payload, selectedFiles))
        : editingId !== null
          ? await newsService.update(editingId, payload)
          : await newsService.create(payload)

      if (!result) {
        setFormError('Unable to save news item')
        return
      }

      toast.success(editingId !== null ? 'News updated' : 'News created')
      navigate('/news')
    } catch {
      setFormError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = editingId !== null ? 'Edit News' : 'Add News'

  return (
    <div className="p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {editingId !== null
              ? 'Update the selected news story.'
              : 'Create a new news story.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/news')}>
            Back to News
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading news item...</div>
      ) : (
        <form
          className="space-y-4 max-w-3xl"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          {formError ? <AlertBox message={formError} type="error" /> : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={formState.header}
              onChange={(event) => setFormState((current) => ({ ...current, header: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Enter title"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Summary / content</span>
            <textarea
              rows={6}
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              placeholder="Enter a short summary or full content"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_100px] items-start">
            <div>
              <span className="text-sm font-medium text-slate-700">Feature Image</span>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="featureImage"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleFileSelection(event.target.files)}
                  className="hidden"
                />
                <label htmlFor="featureImage" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer bg-white shadow-sm hover:bg-slate-50">
                  Upload Images
                </label>
                <div className="h-20 w-20 overflow-hidden rounded-md bg-slate-100 border flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-xs text-slate-500 px-2">No image</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Select one or more images. Max 5MB each. Preview shows the first image.</div>

              {selectedFiles.length > 0 ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <div className="font-medium text-slate-900">Selected files ({selectedFiles.length})</div>
                  <ul className="mt-2 space-y-1">
                    {selectedFiles.map((file) => (
                      <li key={file.name} className="flex items-center justify-between gap-3">
                        <span>{file.name}</span>
                        <span className="text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : existingImages.length > 0 ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-600">
                  <div className="font-medium text-slate-900">Current image{existingImages.length > 1 ? 's' : ''}</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    {existingImages.map((src, index) => (
                      <div key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={src} alt={`Existing image ${index + 1}`} className="h-20 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/news')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !formState.header.trim()}>
              {saving ? 'Saving...' : editingId !== null ? 'Update News' : 'Publish News'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

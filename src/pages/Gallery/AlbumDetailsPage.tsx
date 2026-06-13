import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Plus, Upload, Video, Image as ImageIcon, Trash2, ArrowLeft, LayoutGrid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/button/Button'
import Modal from '../../components/ui/modal/Modal'
import { errorHandler } from '../../common/errorHandler'
import galleryService, { type GalleryItem, type GalleryUploadType, type GalleryMediaType } from '../../services/galleryService'
import MediaUploadSection from '../../components/gallery/MediaUploadSection'
import PreviewGrid from '../../components/gallery/PreviewGrid'
import AlertBox from '../../components/common/AlertBox'
import EmptyState from '../../components/common/EmptyState'
import { getGalleryMediaUrl } from '../../common/mediaUrl'
import ConfirmDialog from '../../components/common/ConfirmDialog'

type SelectedMediaItem = {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

const AlbumDetailsPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaItem[]>([])
  const [uploadType, setUploadType] = useState<'MIXED' | 'IMAGE' | 'VIDEO'>('MIXED')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  
  const [albumTitle, setAlbumTitle] = useState<string>('Loading Album...')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (albumId) {
      loadAlbumMedia()
    }
  }, [albumId])

  useEffect(() => {
    return () => {
      selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [selectedMedia])

  const loadAlbumMedia = async () => {
    if (!albumId) return
    setIsLoadingGallery(true)
    setGalleryError(null)

    try {
      const items = await galleryService.getAlbumMedia(albumId)
      setGalleryItems(items)
      
      if (items.length > 0) {
        setAlbumTitle(items[0].title || 'Untitled Album')
      } else {
        // If empty, we might not have a title from getAlbumMedia, but that's okay for now
        setAlbumTitle('Album Details')
      }
    } catch (error) {
      setGalleryError(errorHandler(error))
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const resetSelectedMedia = () => {
    selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    setSelectedMedia([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openUploadModal = () => setIsUploadModalOpen(true)

  const closeUploadModal = () => {
    if (isUploading) return
    setIsUploadModalOpen(false)
    setUploadError(null)
    setUploadType('MIXED')
    resetSelectedMedia()
  }

  const clearSelectedMedia = () => {
    if (isUploading) return
    setUploadError(null)
    resetSelectedMedia()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const nextSelectedMedia = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        url: URL.createObjectURL(file),
        kind: file.type.startsWith('video/') ? ('video' as const) : ('image' as const),
      }))

    selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    setSelectedMedia(nextSelectedMedia)
    event.target.value = ''

    if (nextSelectedMedia.length === 0) {
      setUploadError('Please select valid image or video files.')
    } else {
      setUploadError(null)
    }
  }

  const handleUploadTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value !== 'IMAGE' && value !== 'VIDEO' && value !== 'MIXED') return
    if (value === uploadType) return

    setUploadError(null)
    setUploadType(value as 'MIXED' | 'IMAGE' | 'VIDEO')
    if (value !== 'MIXED') {
      resetSelectedMedia()
    }
  }

  const removeSelectedMedia = (mediaId: string) => {
    setSelectedMedia((currentMedia) => {
      const targetMedia = currentMedia.find((item) => item.id === mediaId)
      if (targetMedia) {
        URL.revokeObjectURL(targetMedia.url)
      }
      return currentMedia.filter((item) => item.id !== mediaId)
    })
  }

  const addSelectedMediaToGallery = async () => {
    if (selectedMedia.length === 0 || !albumId) return

    setIsUploading(true)
    setUploadError(null)

    try {
      let filesToUpload = selectedMedia
      let uploadTypeToUse: GalleryUploadType = 'IMAGE'
      
      const imageFiles = selectedMedia.filter((m) => m.kind === 'image')
      const videoFiles = selectedMedia.filter((m) => m.kind === 'video')

      if (imageFiles.length > 0) {
        await galleryService.uploadAlbumMedia(albumId, imageFiles.map(i => i.file), 'IMAGE')
      }

      if (videoFiles.length > 0) {
        await galleryService.uploadAlbumMedia(albumId, videoFiles.map(v => v.file), 'VIDEO')
      }

      toast.success('Gallery media uploaded successfully')
      await loadAlbumMedia()
      closeUploadModal()
    } catch (error) {
      const message = errorHandler(error)
      setUploadError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteGalleryItem = async () => {
    if (pendingDeleteId === null) return

    setDeletingId(pendingDeleteId)
    try {
      await galleryService.deleteGalleryItem(pendingDeleteId)
      toast.success('Gallery item deleted successfully')
      
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(String(pendingDeleteId))
        return next
      })
      
      await loadAlbumMedia()
    } catch (error) {
      toast.error(errorHandler(error))
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(galleryItems.map((it) => String(it.id))))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsBulkDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map((id) => galleryService.deleteGalleryItem(id)))
      toast.success('Selected items deleted')
      setSelectedIds(new Set())
      await loadAlbumMedia()
    } catch (error) {
      toast.error(errorHandler(error))
    } finally {
      setIsBulkDeleting(false)
      setPendingBulkDelete(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/gallery')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{albumTitle}</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Manage the media contents of this album.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end">
          <Button type="button" size="sm" startIcon={<Upload size={16} />} onClick={openUploadModal}>
            Upload to Album
          </Button>
        </div>
      </div>

      <AlertBox message={galleryError} type="error" />

      {isLoadingGallery ? (
        <EmptyState message="Loading album media..." />
      ) : galleryItems.length === 0 ? (
        <EmptyState message="No media in this album. Start by uploading images or videos." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                {galleryItems.length} items total
              </span>
              <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 transition ${viewMode === 'grid' ? 'bg-slate-100 text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 transition ${viewMode === 'list' ? 'bg-slate-100 text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={selectAll}
              >
                Select all
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={deselectAll}
              >
                Deselect all
              </button>
              <button
                type="button"
                className="rounded-md border border-brand-red bg-brand-red/5 px-3 py-1.5 text-sm font-medium text-brand-red transition hover:bg-brand-red/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setPendingBulkDelete(true)}
                disabled={selectedIds.size === 0}
              >
                Delete selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </button>
            </div>
          </div>
          
          <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "flex flex-col gap-3"}>
            {galleryItems.map((item) => (
              viewMode === 'grid' ? (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative">
                    <label className="absolute left-2 top-2 z-20 inline-flex items-center justify-center rounded-md bg-white/70 p-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(String(item.id))}
                        onChange={() => toggleSelectItem(String(item.id))}
                        className="h-4 w-4 rounded"
                      />
                    </label>
                    {item.mediaType === 'VIDEO' ? (
                      <video
                        src={getGalleryMediaUrl(item.filePath)}
                        className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={getGalleryMediaUrl(item.filePath)}
                        alt={item.title}
                        className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    )}
                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deletingId === item.id}
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                      {item.mediaType === 'VIDEO' ? <Video size={13} /> : <ImageIcon size={13} />}
                      {item.mediaType}
                    </div>
                    <p className="truncate text-xs text-slate-500" title={item.fileName}>
                      {item.fileName}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <label className="inline-flex items-center justify-center p-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(String(item.id))}
                      onChange={() => toggleSelectItem(String(item.id))}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.mediaType === 'VIDEO' ? (
                      <video
                        src={getGalleryMediaUrl(item.filePath)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={getGalleryMediaUrl(item.filePath)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium text-slate-900 truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      {item.mediaType === 'VIDEO' ? <Video size={13} /> : <ImageIcon size={13} />}
                      {item.mediaType}
                    </div>
                  </div>
                  <div className="pr-2">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(item.id)}
                      className="p-2 text-slate-400 hover:text-brand-red rounded-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingId === item.id}
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        title="Upload to album"
        description="Choose images or videos to add to this album."
        onClose={closeUploadModal}
        closeDisabled={isUploading}
        maxWidthClassName="max-w-4xl"
      >
        <form className="space-y-6 px-6 py-5" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Upload Type</label>
            <select
              value={uploadType}
              onChange={handleUploadTypeChange}
              disabled={isUploading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:bg-slate-50"
            >
              <option value="MIXED">Mixed (Images & Videos)</option>
              <option value="IMAGE">Images Only</option>
              <option value="VIDEO">Videos Only</option>
            </select>
          </div>

          <AlertBox message={uploadError} type="error" />

          <MediaUploadSection
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            isDisabled={isUploading}
            onFileChange={handleFileChange}
          />

          <PreviewGrid
            selectedMedia={selectedMedia}
            isUploading={isUploading}
            onRemove={removeSelectedMedia}
            onClearAll={clearSelectedMedia}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeUploadModal} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="button"
              startIcon={<Plus size={16} />}
              onClick={addSelectedMediaToGallery}
              disabled={selectedMedia.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload files'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete media item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deletingId !== null}
        onConfirm={handleDeleteGalleryItem}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={pendingBulkDelete}
        title="Delete selected items"
        message={`Are you sure you want to delete ${selectedIds.size} selected item(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setPendingBulkDelete(false)}
      />
    </div>
  )
}

export default AlbumDetailsPage

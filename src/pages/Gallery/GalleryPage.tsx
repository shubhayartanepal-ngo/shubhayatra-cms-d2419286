import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Upload, Video, Image as ImageIcon, Trash2, Pencil, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/button/Button'
import Modal from '../../components/ui/modal/Modal'
import { errorHandler } from '../../common/errorHandler'
import galleryService from '../../services/galleryService.ts'
import type { GalleryUploadType, GalleryItem, GalleryMediaType } from '../../services/galleryService.ts'
import MediaUploadSection from '../../components/gallery/MediaUploadSection.tsx'
import PreviewGrid from '../../components/gallery/PreviewGrid.tsx'
import FormFields from '../../components/gallery/FormFields.tsx'
import AlertBox from '../../components/common/AlertBox.tsx'
import EmptyState from '../../components/common/EmptyState.tsx'

import ConfirmDialog from '../../components/common/ConfirmDialog.tsx'

type SelectedMediaItem = {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

const GalleryPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaItem[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<'MIXED' | 'IMAGE' | 'VIDEO'>('MIXED')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null)
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | GalleryMediaType>('ALL')
  
  // Edit Title states
  const [editingGroupItems, setEditingGroupItems] = useState<GalleryItem[]>([])
  const [editingTitle, setEditingTitle] = useState('')
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredGallery()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, filterType])

  useEffect(() => {
    return () => {
      selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [selectedMedia])

  const fetchFilteredGallery = async () => {
    setIsLoadingGallery(true)
    setGalleryError(null)

    try {
      let items: GalleryItem[] = []
      
      if (searchQuery.trim() !== '') {
        items = await galleryService.searchByTitle(searchQuery.trim())
        if (filterType !== 'ALL') {
           items = items.filter(item => item.mediaType === filterType)
        }
      } else if (filterType !== 'ALL') {
        items = await galleryService.searchByType(filterType as GalleryMediaType)
      } else {
        items = await galleryService.listGallery()
      }
      
      setGalleryItems(items)
    } catch (error) {
      setGalleryError(errorHandler(error))
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const groupedGalleryItems = useMemo(() => {
    return galleryItems.reduce((acc, item) => {
      const title = (item.title || 'Untitled').trim()
      if (!acc[title]) {
        acc[title] = []
      }
      acc[title].push(item)
      return acc
    }, {} as Record<string, GalleryItem[]>)
  }, [galleryItems])

  const sortedGroupedGalleryItems = useMemo(() => {
    return Object.entries(groupedGalleryItems).sort((a, b) => {
      const latestA = Math.max(...a[1].map((item) => new Date(item.uploadedAt).getTime()))
      const latestB = Math.max(...b[1].map((item) => new Date(item.uploadedAt).getTime()))

      const safeA = Number.isFinite(latestA) ? latestA : 0
      const safeB = Number.isFinite(latestB) ? latestB : 0

      if (safeA === safeB) {
        return a[0].localeCompare(b[0])
      }

      return safeB - safeA
    })
  }, [groupedGalleryItems])

  const loadGalleryItems = async () => {
    fetchFilteredGallery()
  }

  const resetSelectedMedia = () => {
    selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    setSelectedMedia([])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const closeUploadModal = () => {
    if (isUploading) {
      return
    }

    setIsUploadModalOpen(false)
    setUploadError(null)
    setUploadTitle('')
    setUploadType('MIXED')
    resetSelectedMedia()
  }

  const clearSelectedMedia = () => {
    if (isUploading) {
      return
    }

    setUploadError(null)
    resetSelectedMedia()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) {
      return
    }

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

  const handleUploadTypeChange = (value: string) => {
    if (value !== 'IMAGE' && value !== 'VIDEO' && value !== 'MIXED') {
      return
    }

    if (value === uploadType) {
      return
    }

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
    if (selectedMedia.length === 0) {
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const title = uploadTitle.trim() || new Date().toLocaleDateString()
      
      // Determine which type(s) to upload
      let filesToUpload = selectedMedia
      let uploadTypeToUse: GalleryUploadType = 'IMAGE'
      
      if (uploadType === 'IMAGE') {
        filesToUpload = selectedMedia.filter((m) => m.kind === 'image')
        uploadTypeToUse = 'IMAGE'
      } else if (uploadType === 'VIDEO') {
        filesToUpload = selectedMedia.filter((m) => m.kind === 'video')
        uploadTypeToUse = 'VIDEO'
      } else {
        // MIXED - service will handle separation
        filesToUpload = selectedMedia
        uploadTypeToUse = 'IMAGE' // Default, service will split by actual type
      }
      
      if (filesToUpload.length === 0) {
        setUploadError(`No ${uploadType === 'IMAGE' ? 'images' : uploadType === 'VIDEO' ? 'videos' : 'files'} selected.`)
        return
      }
      
      const response = await galleryService.uploadGalleryMedia({
        files: filesToUpload.map((item) => item.file),
        title,
        type: uploadTypeToUse,
      })

      const successMessage =
        (response && typeof response === 'object' && 'message' in response && response.message) ||
        'Gallery media uploaded successfully'

      toast.success(String(successMessage))
      await loadGalleryItems()
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
      await loadGalleryItems()
    } catch (error) {
      const message = errorHandler(error)
      toast.error(message)
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  const openDeleteConfirm = (id: string | number) => {
    setPendingDeleteId(id)
  }

  const closeDeleteConfirm = () => {
    setPendingDeleteId(null)
  }

  const openEditTitle = (title: string, items: GalleryItem[]) => {
    setEditingGroupItems(items)
    setEditingTitle(title)
  }

  const closeEditTitle = () => {
    setEditingGroupItems([])
    setEditingTitle('')
  }

  const handleUpdateTitle = async () => {
    if (editingGroupItems.length === 0) return
    setIsUpdatingTitle(true)
    try {
      await Promise.all(
        editingGroupItems.map((item) => galleryService.updateTitle(item.id, editingTitle))
      )
      toast.success('Title updated successfully')
      await fetchFilteredGallery()
      closeEditTitle()
    } catch (error) {
      toast.error(errorHandler(error))
    } finally {
      setIsUpdatingTitle(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Gallery</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Manage gallery uploads and preview multiple images or videos before adding them to the
            collection.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end">
          <Button type="button" size="sm" startIcon={<Upload size={16} />} onClick={openUploadModal}>
            Upload Images & Videos
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filterType === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('IMAGE')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filterType === 'IMAGE' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('VIDEO')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filterType === 'VIDEO' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Videos
          </button>
        </div>
      </div>

      <AlertBox message={galleryError} type="error" />

      {isLoadingGallery ? (
        <EmptyState message="Loading gallery..." />
      ) : galleryItems.length === 0 ? (
        <EmptyState message="No gallery items yet. Start by uploading your first image or video." />
      ) : (
        <div className="space-y-10">
          {sortedGroupedGalleryItems.map(([title, items]) => (
            <div key={title} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                <h2 className="text-xl font-medium text-slate-800">{title}</h2>
                <button
                  type="button"
                  onClick={() => openEditTitle(title, items)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand-blue"
                  aria-label={`Edit ${title}`}
                  title="Edit title"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      {item.mediaType === 'VIDEO' ? (
                        <video
                          src={`${import.meta.env.VITE_API_IMAGE_URL}uploads/${item.filePath}`}
                          className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <img
                          src={`${import.meta.env.VITE_API_IMAGE_URL}uploads/${item.filePath}`}
                          alt={item.title}
                          className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      )}
                      <div className="absolute right-2 top-2">
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Delete ${item.title}`}
                          disabled={deletingId === item.id}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 border-t border-slate-100 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          {item.mediaType === 'VIDEO' ? <Video size={13} /> : <ImageIcon size={13} />}
                          {item.mediaType}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500" title={item.fileName}>
                        {item.fileName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        title="Upload gallery media"
        description="Choose multiple images or videos in one go, preview them here, and then upload them to the gallery."
        onClose={closeUploadModal}
        closeDisabled={isUploading}
        maxWidthClassName="max-w-4xl"
      >
        <form className="space-y-6 px-6 py-5" onSubmit={(event) => event.preventDefault()}>
          <FormFields
            uploadTitle={uploadTitle}
            uploadType={uploadType}
            isUploading={isUploading}
            onTitleChange={setUploadTitle}
            onTypeChange={handleUploadTypeChange}
          />

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
              {isUploading ? 'Uploading...' : 'Upload to gallery'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete gallery item"
        message={`Are you sure you want to delete "${galleryItems.find((item) => item.id === pendingDeleteId)?.title || 'this item'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deletingId !== null}
        onConfirm={handleDeleteGalleryItem}
        onCancel={closeDeleteConfirm}
      />

      <Modal
        isOpen={editingGroupItems.length > 0}
        title="Rename Album"
        description="Update the shared title for all media items in this album."
        onClose={closeEditTitle}
        closeDisabled={isUpdatingTitle}
        maxWidthClassName="max-w-md"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Album title</label>
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              placeholder="Enter album title"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeEditTitle} disabled={isUpdatingTitle}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateTitle} disabled={isUpdatingTitle || !editingTitle.trim()}>
              {isUpdatingTitle ? 'Saving...' : 'Save Title'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GalleryPage

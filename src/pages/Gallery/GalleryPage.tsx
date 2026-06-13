import React, { useEffect, useState, useRef } from 'react'
import { Plus, Upload, Trash2, Pencil, Search, Folder, ImageIcon, LayoutGrid, List } from 'lucide-react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import Button from '../../components/ui/button/Button'
import Modal from '../../components/ui/modal/Modal'
import { errorHandler } from '../../common/errorHandler'
import galleryService, { type Album, type GalleryUploadType } from '../../services/galleryService'
import MediaUploadSection from '../../components/gallery/MediaUploadSection'
import PreviewGrid from '../../components/gallery/PreviewGrid'
import FormFields from '../../components/gallery/FormFields'
import AlertBox from '../../components/common/AlertBox'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { getGalleryMediaUrl } from '../../common/mediaUrl'

type SelectedMediaItem = {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

const GalleryPage: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Upload states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaItem[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<'MIXED' | 'IMAGE' | 'VIDEO'>('MIXED')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Delete states
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null)
  
  // Edit title states
  const [editingAlbumId, setEditingAlbumId] = useState<string | number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAlbums()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  useEffect(() => {
    return () => {
      selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [selectedMedia])

  const fetchAlbums = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let items = await galleryService.listAlbums()
      
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        items = items.filter(a => a.programName.toLowerCase().includes(q))
      }
      
      // Sort: maybe latest ID first or alphabetical
      items.sort((a, b) => {
        // Just descending order by ID (assuming higher ID = newer)
        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        return idB - idA
      })
      
      setAlbums(items)
    } catch (err) {
      setError(errorHandler(err))
    } finally {
      setIsLoading(false)
    }
  }

  // UPLOAD LOGIC
  const resetSelectedMedia = () => {
    selectedMedia.forEach((item) => URL.revokeObjectURL(item.url))
    setSelectedMedia([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openUploadModal = () => setIsUploadModalOpen(true)
  const closeUploadModal = () => {
    if (isUploading) return
    setIsUploadModalOpen(false)
    setUploadError(null)
    setUploadTitle('')
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

  const handleUploadTypeChange = (value: string) => {
    if (value !== 'IMAGE' && value !== 'VIDEO' && value !== 'MIXED') return
    if (value === uploadType) return
    setUploadError(null)
    setUploadType(value as 'MIXED' | 'IMAGE' | 'VIDEO')
    if (value !== 'MIXED') resetSelectedMedia()
  }

  const removeSelectedMedia = (mediaId: string) => {
    setSelectedMedia((currentMedia) => {
      const targetMedia = currentMedia.find((item) => item.id === mediaId)
      if (targetMedia) URL.revokeObjectURL(targetMedia.url)
      return currentMedia.filter((item) => item.id !== mediaId)
    })
  }

  const addSelectedMediaToGallery = async () => {
    if (selectedMedia.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const title = uploadTitle.trim() || new Date().toLocaleDateString()
      let filesToUpload = selectedMedia
      let uploadTypeToUse: GalleryUploadType = 'IMAGE'
      
      if (uploadType === 'IMAGE') {
        filesToUpload = selectedMedia.filter((m) => m.kind === 'image')
        uploadTypeToUse = 'IMAGE'
      } else if (uploadType === 'VIDEO') {
        filesToUpload = selectedMedia.filter((m) => m.kind === 'video')
        uploadTypeToUse = 'VIDEO'
      } else {
        filesToUpload = selectedMedia
        uploadTypeToUse = 'IMAGE' 
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
        'Gallery album created successfully'

      toast.success(String(successMessage))
      await fetchAlbums()
      closeUploadModal()
    } catch (error) {
      const message = errorHandler(error)
      setUploadError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  // DELETE LOGIC
  const handleDeleteAlbum = async () => {
    if (pendingDeleteId === null) return
    setDeletingId(pendingDeleteId)
    try {
      await galleryService.deleteAlbum(pendingDeleteId)
      toast.success('Album deleted successfully')
      await fetchAlbums()
    } catch (error) {
      toast.error(errorHandler(error))
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  // EDIT LOGIC
  const openEditTitle = (album: Album) => {
    setEditingAlbumId(album.id)
    setEditingTitle(album.programName)
  }

  const closeEditTitle = () => {
    setEditingAlbumId(null)
    setEditingTitle('')
  }

  const handleUpdateTitle = async () => {
    if (!editingAlbumId) return
    setIsUpdatingTitle(true)
    try {
      await galleryService.updateAlbum(editingAlbumId, { programName: editingTitle })
      toast.success('Album title updated successfully')
      await fetchAlbums()
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Albums</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Manage your gallery albums. Create new albums, or click on one to manage its media.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end">
          <Button type="button" size="sm" startIcon={<Plus size={16} />} onClick={openUploadModal}>
            Create Album
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition ${viewMode === 'grid' ? 'bg-slate-100 text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-2 transition ${viewMode === 'list' ? 'bg-slate-100 text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <AlertBox message={error} type="error" />

      {isLoading ? (
        <EmptyState message="Loading albums..." />
      ) : albums.length === 0 ? (
        <EmptyState message="No albums yet. Create a new album to get started." />
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "flex flex-col gap-3"}>
          {albums.map((album) => (
            viewMode === 'grid' ? (
              <div
                key={album.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col"
                onClick={() => navigate(`/gallery/${album.id}`)}
              >
                <div className="relative h-48 w-full bg-slate-100">
                  {album.coverImage ? (
                    <img
                      src={getGalleryMediaUrl(album.coverImage)}
                      alt={album.programName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Folder size={48} />
                    </div>
                  )}
                  
                  {/* Overlay actions */}
                  <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditTitle(album)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-blue"
                      title="Edit album title"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingDeleteId(album.id)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-red shadow-sm transition hover:bg-brand-red hover:text-white"
                      title="Delete album"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-medium text-slate-900" title={album.programName}>
                      {album.programName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <ImageIcon size={14} />
                      <span>{album.mediaCount} {album.mediaCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={album.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/gallery/${album.id}`)}
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {album.coverImage ? (
                    <img
                      src={getGalleryMediaUrl(album.coverImage)}
                      alt={album.programName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Folder size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col">
                  <h3 className="text-base font-medium text-slate-900 line-clamp-1">{album.programName}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <ImageIcon size={14} />
                    <span>{album.mediaCount} {album.mediaCount === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditTitle(album)
                    }}
                    className="p-2 text-slate-400 hover:text-brand-blue rounded-md transition hover:bg-slate-50"
                    title="Edit album title"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDeleteId(album.id)
                    }}
                    className="p-2 text-slate-400 hover:text-brand-red rounded-md transition hover:bg-slate-50"
                    title="Delete album"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Upload/Create Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        title="Create new album"
        description="Provide a title and select media to instantly create a new album."
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
              {isUploading ? 'Creating Album...' : 'Create Album'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete Album"
        message="Are you sure you want to delete this album? This will permanently remove the album and all its media. This action cannot be undone."
        confirmText="Delete Album"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deletingId !== null}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setPendingDeleteId(null)}
      />

      <Modal
        isOpen={editingAlbumId !== null}
        title="Rename Album"
        description="Update the title for this album."
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

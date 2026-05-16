import React from 'react'
import { Image as ImageIcon, Trash2, Video } from 'lucide-react'
import type { GalleryItem } from '../../services/galleryService'

interface GalleryMediaCardProps {
  item: GalleryItem
  isDeleting: boolean
  onDelete: (id: string | number) => void
}

const GalleryMediaCard: React.FC<GalleryMediaCardProps> = ({ item, isDeleting, onDelete }) => {
  const imageUrl = `${import.meta.env.VITE_API_IMAGE_URL}uploads/${item.filePath}`

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        {item.mediaType === 'VIDEO' ? (
          <video
            src={imageUrl}
            className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
            muted
            playsInline
            controls
          />
        ) : (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Delete ${item.title}`}
          disabled={isDeleting}
          title="Delete item"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1 border-t border-slate-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
            {item.mediaType === 'VIDEO' ? <Video size={13} /> : <ImageIcon size={13} />}
            {item.mediaType}
          </span>
        </div>
        <p className="truncate text-sm font-medium text-slate-900" title={item.title}>
          {item.title}
        </p>
        <p className="truncate text-xs text-slate-500" title={item.fileName}>
          {item.fileName}
        </p>
      </div>
    </div>
  )
}

export default GalleryMediaCard

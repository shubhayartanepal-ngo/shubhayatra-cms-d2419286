import React from 'react'
import { Image as ImageIcon, Trash2, Video } from 'lucide-react'

interface SelectedMediaItem {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

interface MediaPreviewCardProps {
  media: SelectedMediaItem
  isDisabled: boolean
  onRemove: (mediaId: string) => void
}

const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({ media, isDisabled, onRemove }) => {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        {media.kind === 'video' ? (
          <video
            src={media.url}
            className="h-40 w-full object-cover"
            muted
            playsInline
            controls
          />
        ) : (
          <img src={media.url} alt={media.file.name} className="h-40 w-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => onRemove(media.id)}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Remove ${media.file.name}`}
          disabled={isDisabled}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1 px-3 py-2">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
          {media.kind === 'video' ? <Video size={13} /> : <ImageIcon size={13} />}
          <span className="capitalize">{media.kind}</span>
        </div>
        <p className="truncate text-sm text-slate-500" title={media.file.name}>
          {media.file.name}
        </p>
      </div>
    </div>
  )
}

export default MediaPreviewCard

import React from 'react'
import Button from '../ui/button/Button'
import MediaPreviewCard from './MediaPreviewCard'

interface SelectedMediaItem {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

interface PreviewGridProps {
  selectedMedia: SelectedMediaItem[]
  isUploading: boolean
  onRemove: (mediaId: string) => void
  onClearAll: () => void
}

const PreviewGrid: React.FC<PreviewGridProps> = ({
  selectedMedia,
  isUploading,
  onRemove,
  onClearAll,
}) => {
  if (selectedMedia.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        No files selected yet. Pick multiple images or videos to preview them here.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
          <p className="text-sm text-slate-500">
            {selectedMedia.length} file{selectedMedia.length === 1 ? '' : 's'} selected.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearAll}
          disabled={isUploading}
        >
          Clear selection
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {selectedMedia.map((media) => (
          <MediaPreviewCard
            key={media.id}
            media={media}
            isDisabled={isUploading}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

export default PreviewGrid

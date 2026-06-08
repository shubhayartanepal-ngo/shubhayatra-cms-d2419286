import { type NewsItem } from '../../services/newsService'
import Button from '../ui/button/Button'
import Badge from '../ui/badge/Badge'

export default function NewsListItem({
  item,
  isActive,
  onSelect,
  onEdit,
}: {
  item: NewsItem
  isActive: boolean
  onSelect: () => void
  onEdit?: () => void
}) {
  const displayDate = item.date ? new Date(item.date).toLocaleDateString() : ''
  const statusLabel = item.status === 'published' ? 'Published' : item.status === 'archived' ? 'Archived' : 'Draft'
  const previewText = item.summary || item.content || ''

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border px-3 py-3 transition ${
        isActive ? 'border-brand-red bg-brand-red/5 shadow' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 text-left">
          <button onClick={onSelect} className={`w-full text-left ${isActive ? 'font-semibold' : ''}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm leading-5 text-slate-900">{item.title || item.slug}</span>
              <Badge variant="light" color={item.status === 'published' ? 'primary' : item.status === 'archived' ? 'warning' : 'dark'} size="sm">
                {statusLabel}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-1">{displayDate}</div>
            {previewText ? (
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">{previewText}</p>
            ) : null}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="edit"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}

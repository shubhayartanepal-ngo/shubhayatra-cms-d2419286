import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import NewsListItem from '../../components/news/NewsListItem'

import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/button/Button'
import Badge from '../../components/ui/badge/Badge'
import newsService, { type NewsItem } from '../../services/newsService'

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)
  const navigate = useNavigate()

  const load = async () => {
    const list = await newsService.list()
    setItems(list)
    setSelectedId((current) => {
      if (list.length === 0) return null
      if (current === null || !list.some((item) => item.id === current)) return list[0].id
      return current
    })
  }

  useEffect(() => {
    void load()
  }, [])

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId])

  const stats = useMemo(
    () => ({ total: items.length, published: items.filter((i) => i.status === 'published').length }),
    [items]
  )

  const openCreate = () => {
    navigate('/news/new')
  }

  const openEdit = (item: NewsItem) => {
    navigate(`/news/${item.id}/edit`)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const ok = await newsService.remove(deleteTarget.id)
    if (ok) {
      toast.success('Deleted')
      await load()
      setDeleteTarget(null)
    } else {
      toast.error('Delete failed')
    }
  }

  const resetAll = async () => {
    const next = await newsService.reset()
    setItems(next)
    setSelectedId(next[0]?.id ?? null)
    toast.success('Reset to seed')
  }

  return (
    <div className="p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">News & Blog</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>Stories: {stats.total}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Published: {stats.published}</span>
            <span className="text-slate-500">Select a story to edit or preview details.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={openCreate} startIcon={<Plus size={14} />}>
            Add
          </Button>
          <Button type="button" variant="outline" onClick={resetAll}>
            Reset
          </Button>
        </div>
      </header>

      <div className="flex gap-6">
        <aside className="w-72">
            <div className="mb-2 text-sm text-slate-600">Stories</div>
            {items.length === 0 ? (
              <EmptyState
                message="No news stories yet. Create a story to get started."
                action={{
                  label: 'Add news',
                  onClick: openCreate,
                }}
              />
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <NewsListItem
                      item={item}
                      isActive={item.id === selectedId}
                      onSelect={() => setSelectedId(item.id)}
                      onEdit={() => openEdit(item)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </aside>
        <main className="flex-1">
          {selectedItem ? (
            <article>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="truncate">/{selectedItem.slug}</span>
                    <Badge variant="light" color={selectedItem.status === 'published' ? 'primary' : selectedItem.status === 'archived' ? 'warning' : 'dark'} size="sm">
                      {selectedItem.status === 'published' ? 'Published' : selectedItem.status === 'archived' ? 'Archived' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="edit" onClick={() => openEdit(selectedItem)}>Edit</Button>
                  <Button type="button" variant="danger" onClick={() => setDeleteTarget(selectedItem)}>Delete</Button>
                </div>
              </div>

              {selectedItem.image && selectedItem.image.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedItem.image.map((src, index) => (
                    <div key={`${src}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <img src={src} alt={selectedItem.title} className="h-40 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 whitespace-pre-wrap shadow-sm">
                {selectedItem.summary || selectedItem.content || 'No content'}
              </div>
            </article>
          ) : (
            <div className="text-sm text-slate-500">Select a story.</div>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete News"
        message={`Delete "${deleteTarget?.title ?? ''}" permanently?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={false}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

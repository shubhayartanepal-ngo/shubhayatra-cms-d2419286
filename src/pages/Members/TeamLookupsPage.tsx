import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

import Modal from '../../components/ui/modal/Modal'
import Button from '../../components/ui/button/Button'
import { DeleteActionButton, EditActionButton } from '../../components/ui/button/ActionButtons'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import teamService, {
  type DesignationRecord,
  type HonorificRecord,
  type PaginatedResponse,
} from '../../services/teamService'

type LookupKind = 'honorific' | 'designation'

type LookupItem = {
  id: number
  title: string
}

type LookupConfig = {
  kind: LookupKind
  title: string
  description: string
  fieldLabel: string
  emptyMessage: string
  createButtonLabel: string
}

type LookupSectionProps = {
  config: LookupConfig
  items: LookupItem[]
  page: number
  totalPages: number
  totalElements: number
  isLoading: boolean
  savingId: number | null
  deletingId: number | null
  error: string | null
  onCreate: () => void
  onEdit: (item: LookupItem) => void
  onDelete: (item: LookupItem) => void
  onPageChange: (page: number) => void
}

type LookupModalState = {
  kind: LookupKind
  mode: 'create' | 'edit'
  itemId: number | null
  title: string
}

const pageSize = 10

const lookupConfigs: Record<LookupKind, LookupConfig> = {
  honorific: {
    kind: 'honorific',
    title: 'Honorifics',
    description: 'Manage titles used before team member names.',
    fieldLabel: 'Honorific title',
    emptyMessage: 'No honorifics found.',
    createButtonLabel: 'Add Honorific',
  },
  designation: {
    kind: 'designation',
    title: 'Designations',
    description: 'Manage roles assigned to team members.',
    fieldLabel: 'Designation title',
    emptyMessage: 'No designations found.',
    createButtonLabel: 'Add Designation',
  },
}

const emptyPaginatedResponse = <T,>(): PaginatedResponse<T> => ({
  status: true,
  message: '',
  data: [],
  pageNumber: 0,
  pageSize,
  totalElements: 0,
  totalPages: 0,
  lastPage: true,
})

const mapHonorific = (honorific: HonorificRecord): LookupItem | null => {
  const id = Number(honorific.honorificId)
  const title = honorific.honorificTitle ?? honorific.title ?? honorific.name ?? ''

  if (!Number.isFinite(id) || !title.trim()) {
    return null
  }

  return { id, title: title.trim() }
}

const mapDesignation = (designation: DesignationRecord): LookupItem | null => {
  const id = Number(designation.designationId)
  const title = designation.designationTitle ?? designation.title ?? designation.name ?? ''

  if (!Number.isFinite(id) || !title.trim()) {
    return null
  }

  return { id, title: title.trim() }
}

function LookupSection({
  config,
  items,
  page,
  totalPages,
  totalElements,
  isLoading,
  savingId,
  deletingId,
  error,
  onCreate,
  onEdit,
  onDelete,
  onPageChange,
}: LookupSectionProps) {
  const canGoBack = page > 0
  const canGoForward = totalPages > 0 && page + 1 < totalPages

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{config.title}</h2>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} />}
          onClick={onCreate}
        >
          {config.createButtonLabel}
        </Button>
      </div>

      {error ? (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="px-6 py-10 text-sm text-slate-500">
          Loading {config.title.toLowerCase()}...
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">{config.emptyMessage}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[36rem] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">{config.fieldLabel}</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 text-slate-500">{item.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <EditActionButton
                        onClick={() => onEdit(item)}
                        disabled={savingId === item.id || deletingId === item.id}
                      />
                      <DeleteActionButton
                        onClick={() => onDelete(item)}
                        disabled={savingId === item.id || deletingId === item.id}
                        isDeleting={deletingId === item.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {totalElements} records
          {totalPages > 0 ? ` · Page ${page + 1} of ${totalPages}` : ''}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoBack || isLoading}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoForward || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}

function TeamLookupsPage() {
  const [honorifics, setHonorifics] =
    useState<PaginatedResponse<HonorificRecord>>(emptyPaginatedResponse)
  const [designations, setDesignations] =
    useState<PaginatedResponse<DesignationRecord>>(emptyPaginatedResponse)
  const [honorificPage, setHonorificPage] = useState(0)
  const [designationPage, setDesignationPage] = useState(0)
  const [loadingKind, setLoadingKind] = useState<LookupKind | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<{ kind: LookupKind; id: number } | null>(null)
  const [modalState, setModalState] = useState<LookupModalState | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [honorificError, setHonorificError] = useState<string | null>(null)
  const [designationError, setDesignationError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ kind: LookupKind; item: LookupItem } | null>(null)

  const honorificItems = useMemo(
    () => honorifics.data.map(mapHonorific).filter((item): item is LookupItem => item !== null),
    [honorifics.data]
  )
  const designationItems = useMemo(
    () => designations.data.map(mapDesignation).filter((item): item is LookupItem => item !== null),
    [designations.data]
  )

  const loadHonorifics = useCallback(async (page: number) => {
    setLoadingKind('honorific')
    setHonorificError(null)

    try {
      const response = await teamService.listHonorificDetails({ page, size: pageSize })
      setHonorifics(response)
      setHonorificPage(response.pageNumber)
    } catch {
      setHonorificError('Unable to load honorifics right now.')
    } finally {
      setLoadingKind(null)
    }
  }, [])

  const loadDesignations = useCallback(async (page: number) => {
    setLoadingKind('designation')
    setDesignationError(null)

    try {
      const response = await teamService.listDesignationDetails({ page, size: pageSize })
      setDesignations(response)
      setDesignationPage(response.pageNumber)
    } catch {
      setDesignationError('Unable to load designations right now.')
    } finally {
      setLoadingKind(null)
    }
  }, [])

  useEffect(() => {
    void loadHonorifics(0)
    void loadDesignations(0)
  }, [loadDesignations, loadHonorifics])

  const openCreateModal = (kind: LookupKind) => {
    setModalState({
      kind,
      mode: 'create',
      itemId: null,
      title: '',
    })
    setModalError(null)
  }

  const openEditModal = async (kind: LookupKind, item: LookupItem) => {
    setModalState({
      kind,
      mode: 'edit',
      itemId: item.id,
      title: item.title,
    })
    setModalError(null)
    setSaving(true)

    try {
      const response =
        kind === 'honorific'
          ? mapHonorific(await teamService.getHonorific(item.id))
          : mapDesignation(await teamService.getDesignation(item.id))

      if (response) {
        setModalState({
          kind,
          mode: 'edit',
          itemId: response.id,
          title: response.title,
        })
      }
    } catch {
      setModalError(`Unable to load ${lookupConfigs[kind].title.toLowerCase()} details.`)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalState(null)
    setModalError(null)
  }

  const handleModalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!modalState) {
      return
    }

    const title = modalState.title.trim()

    if (!title) {
      setModalError(`${lookupConfigs[modalState.kind].fieldLabel} is required.`)
      return
    }

    setSaving(true)
    setModalError(null)

    try {
      if (modalState.kind === 'honorific') {
        if (modalState.mode === 'create') {
          await teamService.createHonorifics([{ honorificTitle: title }])
        } else if (modalState.itemId !== null) {
          await teamService.updateHonorific(modalState.itemId, { honorificTitle: title })
        }

        await loadHonorifics(honorificPage)
      } else {
        if (modalState.mode === 'create') {
          await teamService.createDesignations([{ designationTitle: title }])
        } else if (modalState.itemId !== null) {
          await teamService.updateDesignation(modalState.itemId, { designationTitle: title })
        }

        await loadDesignations(designationPage)
      }

      toast.success(
        `${lookupConfigs[modalState.kind].fieldLabel} ${
          modalState.mode === 'create' ? 'created' : 'updated'
        } successfully`
      )
      closeModal()
    } catch {
      setModalError(`Failed to save ${lookupConfigs[modalState.kind].fieldLabel.toLowerCase()}.`)
    } finally {
      setSaving(false)
    }
  }

  const deleteLookup = (kind: LookupKind, item: LookupItem) => {
    setPendingDelete({ kind, item })
  }

  const executeDelete = async () => {
    if (!pendingDelete) return
    const { kind, item } = pendingDelete
    setDeleting({ kind, id: item.id })

    try {
      if (kind === 'honorific') {
        await teamService.deleteHonorific(item.id)
        await loadHonorifics(honorificPage)
      } else {
        await teamService.deleteDesignation(item.id)
        await loadDesignations(designationPage)
      }

      toast.success(`${lookupConfigs[kind].fieldLabel} deleted successfully`)
    } catch {
      if (kind === 'honorific') {
        setHonorificError('Failed to delete honorific.')
      } else {
        setDesignationError('Failed to delete designation.')
      }
    } finally {
      setDeleting(null)
      setPendingDelete(null)
    }
  }

  const activeConfig = modalState ? lookupConfigs[modalState.kind] : null

  return (
    <main className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Team Settings</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Manage honorific and designation records used by the team member form.
        </p>
      </div>

      <div className="grid gap-6 ">
        <LookupSection
          config={lookupConfigs.honorific}
          items={honorificItems}
          page={honorificPage}
          totalPages={honorifics.totalPages}
          totalElements={honorifics.totalElements}
          isLoading={loadingKind === 'honorific'}
          savingId={modalState?.kind === 'honorific' ? modalState.itemId : null}
          deletingId={deleting?.kind === 'honorific' ? deleting.id : null}
          error={honorificError}
          onCreate={() => openCreateModal('honorific')}
          onEdit={(item) => void openEditModal('honorific', item)}
          onDelete={(item) => void deleteLookup('honorific', item)}
          onPageChange={(page) => void loadHonorifics(page)}
        />

        <LookupSection
          config={lookupConfigs.designation}
          items={designationItems}
          page={designationPage}
          totalPages={designations.totalPages}
          totalElements={designations.totalElements}
          isLoading={loadingKind === 'designation'}
          savingId={modalState?.kind === 'designation' ? modalState.itemId : null}
          deletingId={deleting?.kind === 'designation' ? deleting.id : null}
          error={designationError}
          onCreate={() => openCreateModal('designation')}
          onEdit={(item) => void openEditModal('designation', item)}
          onDelete={(item) => void deleteLookup('designation', item)}
          onPageChange={(page) => void loadDesignations(page)}
        />
      </div>

      {modalState && activeConfig ? (
        <Modal
          isOpen
          title={`${modalState.mode === 'create' ? 'Add' : 'Edit'} ${activeConfig.fieldLabel}`}
          description={`${modalState.mode === 'create' ? 'Create' : 'Update'} a ${activeConfig.fieldLabel.toLowerCase()} entry.`}
          onClose={closeModal}
          closeDisabled={saving}
          maxWidthClassName="max-w-lg"
        >
          <form onSubmit={handleModalSubmit} className="space-y-5 px-6 py-6">
            {modalError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {modalError}
              </div>
            ) : null}

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{activeConfig.fieldLabel}</span>
              <input
                type="text"
                required
                value={modalState.title}
                onChange={(event) =>
                  setModalState((current) =>
                    current ? { ...current, title: event.target.value } : current
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder={activeConfig.kind === 'honorific' ? 'Dr.' : 'President'}
              />
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : modalState.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Delete ${pendingDelete ? lookupConfigs[pendingDelete.kind].fieldLabel.toLowerCase() : 'entry'}`}
        message={`Are you sure you want to delete "${pendingDelete?.item.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleting !== null}
        onConfirm={executeDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  )
}

export default TeamLookupsPage

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import toast from 'react-hot-toast'

import TeamMemberModal, {
  type LookupOption,
  type TeamFormState,
} from '../../components/members/TeamMemberModal'
import Button from '../../components/ui/button/Button'
import teamService, {
  type DesignationRecord,
  type HonorificRecord,
  type TeamPayload,
  type TeamRecord,
} from '../../services/teamService'

const fallbackHonorificOptions = [
  { id: 1, label: 'Mr.' },
  { id: 2, label: 'Mrs.' },
  { id: 3, label: 'Ms.' },
  { id: 4, label: 'Dr.' },
]

const fallbackDesignationOptions = [
  { id: 1, label: 'Coordinator' },
  { id: 2, label: 'Volunteer' },
  { id: 3, label: 'Member' },
  { id: 4, label: 'Admin' },
]

type TeamRow = {
  teamId: number
  teamName: string
  teamProfilePic: string
  honorificLabel: string
  designationLabels: string[]
  teamTwitterLink: string
  teamLinkedInLink: string
  teamFacebookLink: string
}

const defaultFormState: TeamFormState = {
  teamName: '',
  teamTwitterLink: '',
  teamLinkedInLink: '',
  teamFacebookLink: '',
  honorificId: '',
  designationIds: [],
}


const normalize = (value: string) => value.trim().toLowerCase()

const resolveHonorificId = (team: TeamRecord, honorificOptions: LookupOption[]) => {
  if (team.honorific?.honorificId !== undefined && team.honorific?.honorificId !== null) {
    return String(team.honorific.honorificId)
  }

  const honorificLabel =
    team.honorific?.honorificTitle ?? team.honorific?.title ?? team.honorific?.name ?? ''
  const matchedOption = honorificOptions.find(
    (option) => normalize(option.label) === normalize(honorificLabel)
  )

  return matchedOption ? String(matchedOption.id) : ''
}

const resolveDesignationIds = (team: TeamRecord, designationOptions: LookupOption[]) => {
  const idsFromApi = (team.designations ?? [])
    .map((designation) => designation.designationId)
    .filter(
      (designationId): designationId is number =>
        designationId !== undefined && designationId !== null
    )

  if (idsFromApi.length > 0) {
    return idsFromApi.map(String)
  }

  const labels = (team.designations ?? []).flatMap((designation) => [
    designation.designationTitle,
    designation.title,
    designation.name,
  ])

  return designationOptions
    .filter((option) =>
      labels.some((label) => normalize(String(label ?? '')) === normalize(option.label))
    )
    .map((option) => String(option.id))
}

const buildFormStateFromTeam = (
  team: TeamRecord,
  honorificOptions: LookupOption[],
  designationOptions: LookupOption[]
): TeamFormState => ({
  teamName: team.teamName ?? '',
  teamTwitterLink: team.teamTwitterLink ?? '',
  teamLinkedInLink: team.teamLinkedInLink ?? '',
  teamFacebookLink: team.teamFacebookLink ?? '',
  honorificId: resolveHonorificId(team, honorificOptions),
  designationIds: resolveDesignationIds(team, designationOptions),
})

const buildPayload = (formState: TeamFormState): TeamPayload => ({
  teamName: formState.teamName.trim(),
  teamTwitterLink: formState.teamTwitterLink.trim(),
  teamLinkedInLink: formState.teamLinkedInLink.trim(),
  teamFacebookLink: formState.teamFacebookLink.trim(),
  honorific: {
    honorificId: Number(formState.honorificId),
  },
  designations: formState.designationIds.map((designationId) => ({
    designationId: Number(designationId),
  })),
})

const resolveTeamProfilePic = (team: TeamRecord) =>
  team.teamProfilePic ?? team.teamProfilePic ?? team.imageUrl ?? team.profileImage ?? ''

const mapTeamRecordToRow = (team: TeamRecord): TeamRow => ({
  teamId: Number(team.teamId ?? team.id ?? 0),
  teamName: team.teamName ?? 'Untitled',
  teamProfilePic: resolveTeamProfilePic(team),
  honorificLabel:
    team.honorific?.honorificTitle ?? team.honorific?.title ?? team.honorific?.name ?? 'Unknown',
  designationLabels:
    team.designations
      ?.map((designation) => designation.designationTitle ?? designation.title ?? designation.name)
      .filter((label): label is string => Boolean(label)) ?? [],
  teamTwitterLink: team.teamTwitterLink ?? '',
  teamLinkedInLink: team.teamLinkedInLink ?? '',
  teamFacebookLink: team.teamFacebookLink ?? '',
})

const mapHonorificRecordToOption = (honorific: HonorificRecord): LookupOption | null => {
  const id = Number(honorific.honorificId)
  const label = honorific.honorificTitle ?? honorific.title ?? honorific.name ?? ''

  if (!Number.isFinite(id) || !label.trim()) {
    return null
  }

  return {
    id,
    label: label.trim(),
  }
}

const mapDesignationRecordToOption = (designation: DesignationRecord): LookupOption | null => {
  const id = Number(designation.designationId)
  const label = designation.designationTitle ?? designation.title ?? designation.name ?? ''

  if (!Number.isFinite(id) || !label.trim()) {
    return null
  }

  return {
    id,
    label: label.trim(),
  }
}

function MemberPage() {
  const [honorificOptions, setHonorificOptions] = useState<LookupOption[]>(fallbackHonorificOptions)
  const [designationOptions, setDesignationOptions] = useState<LookupOption[]>(
    fallbackDesignationOptions
  )
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [formState, setFormState] = useState<TeamFormState>(defaultFormState)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null)
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const loadTeams = async () => {
    setIsLoadingTeams(true)
    setPageError(null)

    try {
      const teamRecords = await teamService.listTeams()
      console.log(`${import.meta.env.VITE_API_IMAGE_URL}${teamRecords[0].teamProfilePic}`);
      setTeams(teamRecords.map(mapTeamRecordToRow))
    } catch {
      setPageError('Unable to load teams right now.')
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const loadHonorifics = async () => {
    try {
      const honorificRecords = await teamService.listHonorifics()
      const options = honorificRecords
        .map(mapHonorificRecordToOption)
        .filter((option): option is LookupOption => option !== null)

      if (options.length > 0) {
        setHonorificOptions(options)
      }
    } catch {
      // Fall back to local options when the public endpoint is unavailable.
    }
  }

  const loadDesignations = async () => {
    try {
      const designationRecords = await teamService.listDesignations()
      const options = designationRecords
        .map(mapDesignationRecordToOption)
        .filter((option): option is LookupOption => option !== null)

      if (options.length > 0) {
        setDesignationOptions(options)
      }
    } catch {
      // Fall back to local options when the public endpoint is unavailable.
    }
  }

  useEffect(() => {
    void loadTeams()
    void loadHonorifics()
    void loadDesignations()
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  const resetModalState = () => {
    setIsModalOpen(false)
    setEditingTeamId(null)
    setFormState(defaultFormState)
    setSelectedImage(null)
    setFormError(null)
  }

  const openCreateModal = () => {
    setEditingTeamId(null)
    setFormState(defaultFormState)
    setSelectedImage(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = async (teamId: number) => {
    setEditingTeamId(teamId)
    setFormError(null)
    setSelectedImage(null)
    setIsModalOpen(true)
    setIsLoadingTeam(true)

    try {
      const team = await teamService.getTeam(teamId)
      setFormState(buildFormStateFromTeam(team, honorificOptions, designationOptions))
    } catch {
      setFormState(defaultFormState)
      setFormError('Unable to load team details.')
    } finally {
      setIsLoadingTeam(false)
    }
  }

  const closeModal = () => {
    if (isSaving || isLoadingTeam || isUploading) {
      return
    }

    resetModalState()
  }

  const toggleDesignation = (designationId: string) => {
    setFormState((current) => ({
      ...current,
      designationIds: current.designationIds.includes(designationId)
        ? current.designationIds.filter((id) => id !== designationId)
        : [...current.designationIds, designationId],
    }))
  }

  const handleFieldChange = <K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.teamName.trim()) {
      setFormError('Team name is required.')
      return
    }

    if (!formState.honorificId) {
      setFormError('Honorific is required.')
      return
    }

    if (!formState.teamTwitterLink.trim()) {
      setFormError('Twitter link is required.')
      return
    }

    if (!formState.teamLinkedInLink.trim()) {
      setFormError('LinkedIn link is required.')
      return
    }

    if (!formState.teamFacebookLink.trim()) {
      setFormError('Facebook link is required.')
      return
    }

    if (formState.designationIds.length === 0) {
      setFormError('Select at least one designation.')
      return
    }

    const payload = buildPayload(formState)
    setIsSaving(true)
    setFormError(null)

    try {
      const savedTeam =
        editingTeamId !== null
          ? await teamService.updateTeam(editingTeamId, payload)
          : await teamService.createTeam(payload)

      const savedTeamId = Number(savedTeam.teamId ?? savedTeam.id ?? editingTeamId ?? 0)
      let imageUploadFailed = false

      if (selectedImage && Number.isFinite(savedTeamId) && savedTeamId > 0) {
        setIsUploading(true)

        try {
          await teamService.uploadProfileImage(savedTeamId, selectedImage)
          setSelectedImage(null)
        } catch {
          imageUploadFailed = true
        } finally {
          setIsUploading(false)
        }
      }

      await loadTeams()

      if (imageUploadFailed) {
        setFormError('Team saved, but image upload failed.')
        return
      }

      if (editingTeamId !== null) {
        toast.success('Team updated successfully')
      } else {
        toast.success('Team created successfully')
      }

      resetModalState()
    } catch {
      setFormError('Failed to save team.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedImage(event.target.files?.[0] ?? null)
  }

  const handleDeleteTeam = async (teamId: number) => {
    const team = teams.find((entry) => entry.teamId === teamId)

    if (!window.confirm(`Delete ${team?.teamName ?? 'this team'}?`)) {
      return
    }

    setDeletingTeamId(teamId)
    setPageError(null)

    try {
      await teamService.deleteTeam(teamId)
      setTeams((currentTeams) => currentTeams.filter((entry) => entry.teamId !== teamId))
      toast.success('Team deleted successfully')
    } catch {
      setPageError('Failed to delete team.')
    } finally {
      setDeletingTeamId(null)
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex items-end justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Team Members</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Manage team records, including the JSON payload for create and update requests.
          </p>
        </div>

        <div className="flex items-center justify-end">
          <Button type="button" variant="primary" onClick={openCreateModal}>
            Add Team
          </Button>
        </div>
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        editingTeamId={editingTeamId}
        formState={formState}
        honorificOptions={honorificOptions}
        designationOptions={designationOptions}
        formError={formError}
        isLoadingTeam={isLoadingTeam}
        isSaving={isSaving}
        isUploading={isUploading}
        selectedImage={selectedImage}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        onToggleDesignation={toggleDesignation}
        onImageChange={handleImageChange}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Team List</h2>
            <p className="text-sm text-slate-500">{teams.length} records</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Updated today
          </span>
        </div>

        {pageError && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            {pageError}
          </div>
        )}

        {isLoadingTeams ? (
          <div className="px-6 py-10 text-sm text-slate-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">No team records found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[68rem] divide-y divide-slate-200 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                <tr>
                  <th className="px-6 py-3 font-medium">Image</th>
                  <th className="px-6 py-3 font-medium">Team Name</th>
                  <th className="px-6 py-3 font-medium">Honorific</th>
                  <th className="px-6 py-3 font-medium">Designations</th>
                  <th className="px-6 py-3 font-medium">Twitter</th>
                  <th className="px-6 py-3 font-medium">LinkedIn</th>
                  <th className="px-6 py-3 font-medium">Facebook</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {teams.map((team) => (
                  <tr key={team.teamId} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">




                      {team.teamProfilePic ? (

                        <img
                          src={`${import.meta.env.VITE_API_IMAGE_URL}/${team.teamProfilePic}`}
                          alt={team.teamName}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{team.teamName}</td>
                    <td className="px-6 py-4 text-slate-600">{team.honorificLabel}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {team.designationLabels.join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="max-w-48 truncate" title={team.teamTwitterLink || undefined}>
                        {team.teamTwitterLink || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="max-w-48 truncate" title={team.teamLinkedInLink || undefined}>
                        {team.teamLinkedInLink || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="max-w-48 truncate" title={team.teamFacebookLink || undefined}>
                        {team.teamFacebookLink || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void openEditModal(team.teamId)}
                          disabled={deletingTeamId === team.teamId}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDeleteTeam(team.teamId)}
                          disabled={deletingTeamId === team.teamId}
                        >
                          {deletingTeamId === team.teamId ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default MemberPage

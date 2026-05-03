import type { ChangeEvent, FormEvent } from 'react'

import Button from '../ui/button/Button'
import Modal from '../ui/modal/Modal'

export type LookupOption = {
  id: number
  label: string
}

export type TeamFormState = {
  teamName: string
  teamTwitterLink: string
  teamLinkedInLink: string
  teamFacebookLink: string
  honorificId: string
  designationIds: string[]
}

type TeamMemberModalProps = {
  isOpen: boolean
  editingTeamId: number | null
  formState: TeamFormState
  honorificOptions: LookupOption[]
  designationOptions: LookupOption[]
  formError: string | null
  isLoadingTeam: boolean
  isSaving: boolean
  isUploading: boolean
  selectedImage: File | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFieldChange: <K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) => void
  onToggleDesignation: (designationId: string) => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function TeamMemberModal({
  isOpen,
  editingTeamId,
  formState,
  honorificOptions,
  designationOptions,
  formError,
  isLoadingTeam,
  isSaving,
  isUploading,
  selectedImage,
  onClose,
  onSubmit,
  onFieldChange,
  onToggleDesignation,
  onImageChange,
}: TeamMemberModalProps) {
  const isEditMode = editingTeamId !== null
  const isCloseDisabled = isSaving || isLoadingTeam || isUploading

  return (
    <Modal
      isOpen={isOpen}
      title={isEditMode ? 'Edit Team' : 'Add Team'}
      description={
        isEditMode
          ? 'Update the team record using IDs only in the request body.'
          : 'Create a new team record with the required JSON payload.'
      }
      onClose={onClose}
      closeDisabled={isCloseDisabled}
    >
      {isLoadingTeam ? (
        <div className="px-6 py-10 text-sm text-slate-500">Loading team details...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6 px-6 py-6">
          {formError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Team Name</span>
              <input
                type="text"
                required
                value={formState.teamName}
                onChange={(event) => onFieldChange('teamName', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="Enter team name"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Honorific</span>
              <select
                required
                value={formState.honorificId}
                onChange={(event) => onFieldChange('honorificId', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">Select honorific</option>
                {honorificOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Designations</span>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
                {designationOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={formState.designationIds.includes(String(option.id))}
                      onChange={() => onToggleDesignation(String(option.id))}
                      disabled={isSaving || isUploading}
                      className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Twitter Link</span>
              <input
                type="url"
                required
                value={formState.teamTwitterLink}
                onChange={(event) => onFieldChange('teamTwitterLink', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="https://www.example.com"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">LinkedIn Link</span>
              <input
                type="url"
                required
                value={formState.teamLinkedInLink}
                onChange={(event) => onFieldChange('teamLinkedInLink', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="https://www.example.com"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Facebook Link</span>
              <input
                type="url"
                required
                value={formState.teamFacebookLink}
                onChange={(event) => onFieldChange('teamFacebookLink', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="https://www.example.com"
              />
            </label>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
            <div className="space-y-2">
              <label className="flex-1 space-y-2">
                <span className="text-sm font-medium text-slate-700">Select an image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  disabled={isSaving || isUploading}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
            </div>
{/* 
            {selectedImage ? (
              <p className="mt-3 text-sm text-slate-600">Selected: {selectedImage.name}</p>
            ) : null} */}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCloseDisabled}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || isLoadingTeam || isUploading}
            >
              {isSaving ? 'Saving...' : isEditMode ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default TeamMemberModal

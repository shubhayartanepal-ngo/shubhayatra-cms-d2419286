import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'

import { ExternalLink } from 'lucide-react'
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import { Link } from 'react-router'

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
  onRefreshOptions: () => void
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
  onRefreshOptions,
}: TeamMemberModalProps) {
  const isEditMode = editingTeamId !== null
  const isCloseDisabled = isSaving || isLoadingTeam || isUploading
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(selectedImage)
    setImagePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedImage])

  return (
    <Modal
      isOpen={isOpen}
      title={isEditMode ? 'Edit Team Member' : 'Add Team Member'}
      description={
        isEditMode
          ? 'Update team member details, roles, social links, and profile image.'
          : 'Add a new team member with role, social links, and profile image.'
      }
      onClose={onClose}
      closeDisabled={isCloseDisabled}
      maxWidthClassName="max-w-3xl"
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

          <div className="space-y-6">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Team Name</span>
              <input
                type="text"
                required
                value={formState.teamName}
                onChange={(event) => onFieldChange('teamName', event.target.value)}
                disabled={isSaving || isUploading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="Enter Full Name"
              />
            </label>

            <div className="flex flex-col gap-8 mt-2 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-slate-700 bg-slate-50 shadow-sm">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Profile image preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="h-full w-full rounded-full bg-linear-to-br from-slate-50 to-slate-100" />
                )}
              </div>

                <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Profile Image Preview</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedImage ? `Selected: ${selectedImage.name}` : 'Choose a square image for the best fit.'}
                  </p>
                </div>

                <label className="inline-flex w-fit cursor-pointer items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
                  Choose File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg" 
                    onChange={onImageChange}
                    disabled={isSaving || isUploading}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <label className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Honorific</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onRefreshOptions}
                    className="text-xs text-slate-500 hover:text-brand-blue"
                    title="Refresh honorifics"
                  >
                    Refresh
                  </button>
                  <Link
                    to="/team-settings"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                  >
                    Add new <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Designations</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onRefreshOptions} className="text-xs text-slate-500 hover:text-brand-blue" title="Refresh designations">
                    Refresh
                  </button>
                  <Link to="/team-settings" target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline">
                    Add new <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                {designationOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onToggleDesignation(String(option.id))}
                    disabled={isSaving || isUploading}
                    aria-pressed={formState.designationIds.includes(String(option.id))}
                    className={`inline-flex items-center gap-3 rounded-full border px-5 py-2 text-sm shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      formState.designationIds.includes(String(option.id))
                        ? 'border-emerald-300 bg-emerald-100 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                    <span className="text-base leading-none text-slate-500">×</span>
                  </button>
                ))}
              </div>
            </div>

            <SocialLinkField
              label="Twitter Link"
              value={formState.teamTwitterLink}
              placeholder="https://twitter.com/username"
              icon={<FaTwitter size={18} />}
              iconClassName="bg-[#1DA1F2] text-white"
              onChange={(value) => onFieldChange('teamTwitterLink', value)}
              disabled={isSaving || isUploading}
            />

            <SocialLinkField
              label="LinkedIn Link"
              value={formState.teamLinkedInLink}
              placeholder="https://linkedin.com/in/username"
              icon={<FaLinkedinIn size={18} />}
              iconClassName="bg-[#0A66C2] text-white"
              onChange={(value) => onFieldChange('teamLinkedInLink', value)}
              disabled={isSaving || isUploading}
            />

            <SocialLinkField
              label="Facebook Link"
              value={formState.teamFacebookLink}
              placeholder="https://facebook.com/username"
              icon={<FaFacebookF size={18} />}
              iconClassName="bg-[#1877F2] text-white"
              onChange={(value) => onFieldChange('teamFacebookLink', value)}
              disabled={isSaving || isUploading}
            />
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

type SocialLinkFieldProps = {
  label: string
  value: string
  placeholder: string
  icon: ReactNode
  iconClassName: string
  onChange: (value: string) => void
  disabled?: boolean
}

function SocialLinkField({
  label,
  value,
  placeholder,
  icon,
  iconClassName,
  onChange,
  disabled = false,
}: SocialLinkFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/10">
        <span className={`flex w-12 items-center justify-center ${iconClassName}`}>{icon}</span>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="min-w-0 flex-1 border-0 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
          placeholder={placeholder}
        />
      </div>
    </label>
  )
}

export default TeamMemberModal

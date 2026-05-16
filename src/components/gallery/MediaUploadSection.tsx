import React from 'react'
import { Upload } from 'lucide-react'
import FileInput from '../form/input/FileInput'

interface MediaUploadSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement>
  isDisabled: boolean
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  fileInputRef,
  isDisabled,
  onFileChange,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex space-y-3 space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-red shadow-sm">
            <Upload size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Select files</h3>
            <p className="text-sm text-slate-500">Upload multiple images and videos at once.</p>
          </div>
        </div>
      </div>
      <FileInput
        ref={fileInputRef}
        multiple
        accept="image/*,video/*"
        onChange={onFileChange}
        className={`bg-white ${isDisabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      />
    </div>
  )
}

export default MediaUploadSection

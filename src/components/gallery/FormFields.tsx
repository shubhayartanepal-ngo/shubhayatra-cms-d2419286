import React from 'react'
import Label from '../form/Label'
import Select from '../form/Select'

interface FormFieldsProps {
  uploadTitle: string
  uploadType: 'MIXED' | 'IMAGE' | 'VIDEO'
  isUploading: boolean
  onTitleChange: (value: string) => void
  onTypeChange: (value: string) => void
}

const FormFields: React.FC<FormFieldsProps> = ({
  uploadTitle,
  uploadType,
  isUploading,
  onTitleChange,
  onTypeChange,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="gallery-title">
          Title <span className="text-xs text-slate-500">(optional)</span>
        </Label>
        <input
          id="gallery-title"
          type="text"
          value={uploadTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Gallery / event title"
          className="h-12 w-full rounded-[0.65rem] border border-[#b9c2da] bg-white px-3.5 py-3 text-sm text-[#1f2230] outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gallery-type">Type</Label>
        <Select
          id="gallery-type"
          name="gallery-type"
          value={uploadType}
          onChange={onTypeChange}
          disabled={isUploading}
          options={[
            { value: 'MIXED', label: 'All Media' },
            { value: 'IMAGE', label: 'Images Only' },
            { value: 'VIDEO', label: 'Videos Only' },
          ]}
        />
      </div>
    </div>
  )
}

export default FormFields

import { useState } from 'react'
import ComponentCard from '../../common/ComponentCard'

export default function ToggleSwitch() {
  const [enabled, setEnabled] = useState(true)
  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-brand-red"
          />
          <span>Enabled</span>
        </label>
        <label className="inline-flex items-center gap-2 opacity-60">
          <input type="checkbox" checked disabled className="h-4 w-4 accent-brand-red" />
          <span>Disabled</span>
        </label>
      </div>
    </ComponentCard>
  )
}

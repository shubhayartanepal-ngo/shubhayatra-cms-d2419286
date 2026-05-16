import React, { type ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  icon?: ReactNode
  action?: { label: string; onClick: () => void }
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, action }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
      {icon && <div className="mb-4 flex justify-center text-slate-400">{icon}</div>}
      <p className="text-sm text-slate-500">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState

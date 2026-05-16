import type { MouseEvent, ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  isOpen: boolean
  title: string
  description?: string
  onClose: () => void
  closeDisabled?: boolean
  children: ReactNode
  maxWidthClassName?: string
}

function Modal({
  isOpen,
  title,
  description,
  onClose,
  closeDisabled = false,
  children,
  maxWidthClassName = 'max-w-2xl',
}: ModalProps) {
  if (!isOpen) {
    return null
  }

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`max-h-[calc(100vh-3rem)] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${maxWidthClassName}`}
        onClick={handlePanelClick}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-semibold leading-none text-brand-red transition hover:bg-red-50 hover:text-brand-dark-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Modal

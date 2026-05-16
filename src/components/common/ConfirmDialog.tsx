import Button from '../ui/button/Button'
import Modal from '../ui/modal/Modal'

interface ConfirmDialogProps {
  /** Controls modal visibility. */
  isOpen: boolean
  /** Dialog heading shown in the modal header. */
  title: string
  /** Main confirmation text shown in the body. */
  message: string
  /** Label for the primary action button. */
  confirmText?: string
  /** Label for the secondary action button. */
  cancelText?: string
  /** Whether primary action should use destructive styling. */
  isDestructive?: boolean
  /** Disables actions while async work is running. */
  isLoading?: boolean
  /** Optional loading label for the primary button. */
  loadingText?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  loadingText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const resolvedLoadingText =
    loadingText ??
    `${confirmText.endsWith('e') ? confirmText.slice(0, -1) : confirmText}ing...`

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      closeDisabled={isLoading}
      maxWidthClassName="max-w-md"
    >
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-slate-600">{message}</p>

        <div className="flex gap-3 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? resolvedLoadingText : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog

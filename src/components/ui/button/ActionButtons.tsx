import type { MouseEvent, ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import Button from './Button'

type ActionButtonProps = {
  children?: ReactNode
  disabled?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export function EditActionButton({ children = 'Edit', disabled, onClick }: ActionButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="edit"
      startIcon={<Pencil size={15} />}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

type DeleteActionButtonProps = ActionButtonProps & {
  isDeleting?: boolean
}

export function DeleteActionButton({
  children = 'Delete',
  disabled,
  isDeleting = false,
  onClick,
}: DeleteActionButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="danger"
      startIcon={<Trash2 size={15} />}
      onClick={onClick}
      disabled={disabled}
    >
      {isDeleting ? 'Deleting...' : children}
    </Button>
  )
}

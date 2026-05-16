import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'

interface ButtonProps {
  type?: 'button' | 'submit'
  children: ReactNode
  size?: 'sm' | 'md'
  variant?: 'primary' | 'outline' | 'secondary' | 'edit' | 'danger'
  startIcon?: ReactNode
  endIcon?: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  to?: string
}

const Button = ({
  type = 'button',
  children,
  size = 'md',
  variant = 'primary',
  startIcon,
  endIcon,
  onClick,
  className = '',
  disabled = false,
  to,
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
  }

  const variantClasses = {
    primary:
      'bg-linear-to-b from-brand-red to-brand-dark-red text-white shadow-[0_12px_20px_rgba(240,50,50,0.25)] hover:-translate-y-0.5 hover:shadow-[0_14px_22px_rgba(240,50,50,0.32)]',
    secondary:
      'bg-brand-blue text-white shadow-[0_12px_20px_rgba(37,50,102,0.18)] hover:bg-brand-blue/90',
    outline: 'border border-brand-blue/20 bg-white text-brand-blue hover:bg-brand-blue/5',
    edit: 'border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
    danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  }

  const sharedClasses = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    sizeClasses[size],
    variantClasses[variant],
    disabled ? 'cursor-not-allowed opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link
        className={sharedClasses}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        to={to}
      >
        {startIcon && <span className="flex items-center">{startIcon}</span>}
        {children}
        {endIcon && <span className="flex items-center">{endIcon}</span>}
      </Link>
    )
  }

  return (
    <button type={type} className={sharedClasses} onClick={(e) => onClick?.(e)} disabled={disabled}>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  )
}

export default Button

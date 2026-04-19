import type { FormEvent, ReactNode } from 'react'

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  className?: string
}

const Form = ({ onSubmit, children, className }: FormProps) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}
      className={` ${className}`}
    >
      {children}
    </form>
  )
}

export default Form

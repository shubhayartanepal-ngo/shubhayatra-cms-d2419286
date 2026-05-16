import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import InputField from '../../components/form/input/InputField'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = email.trim().length > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    setIsLoading(true)

    try {
      await authService.forgotPassword({ email: email.trim() })
      toast.success('Reset link sent to your email')
    } catch (error) {
      const message = errorHandler(error)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      activeView="login"
      title="Forgot password"
      subtitle="Enter your email address and we will send you a reset link."
      footer={
        <p className="m-0 pt-1 text-center text-sm text-brand-muted">
          Remembered your password?{' '}
          <Link
            className="font-semibold text-brand-blue hover:underline hover:decoration-brand-red hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            to="/login"
          >
            Back to login
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
        <InputField
          label={
            <span>
              Email <span className="text-red-500">*</span>
            </span>
          }
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter a valid email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Button
          className="w-full"
          type="submit"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default ForgotPasswordPage

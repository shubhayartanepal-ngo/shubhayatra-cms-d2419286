import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, useNavigate } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import Modal from '../../components/ui/modal/Modal'
import InputField from '../../components/form/input/InputField'
import AlertBox from '../../components/common/AlertBox'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'
import { storeAuthToken } from '../../common/authStorage'

const isVerificationError = (message: string) => {
  const normalizedMessage = message.toLowerCase()

  return normalizedMessage.includes('verify') || normalizedMessage.includes('verification')
}

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin@subhayatra')
  const [password, setPassword] = useState('Subhayatra@admin1')
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [isResendModalOpen, setResendModalOpen] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendError, setResendError] = useState('')
  const [isResending, setIsResending] = useState(false)

  const isFormValid = username.trim() !== '' && password.trim() !== ''

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required')
      return
    }

    setFormError('')
    setIsLoading(true)

    try {
      const response = await authService.login({ username: username.trim(), password })
      storeAuthToken(response)
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      const message = errorHandler(error)
      setFormError(message)
      toast.error(message)

      if (isVerificationError(message)) {
        setResendEmail('')
        setResendError('')
        setResendModalOpen(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const closeResendModal = () => {
    if (isResending) {
      return
    }

    setResendModalOpen(false)
    setResendError('')
  }

  const handleResendToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!resendEmail.trim()) {
      setResendError('Email is required')
      return
    }

    setIsResending(true)
    setResendError('')

    try {
      await authService.resendToken({ email: resendEmail.trim() })
      toast.success('Verification link sent to your email')
      setResendModalOpen(false)
    } catch (error) {
      const message = errorHandler(error)
      setResendError(message)
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthPageShell
      activeView="login"
      title="Welcome back"
      subtitle="Sign in to continue managing programs, volunteers, and community updates."
      footer={
        <p className="m-0 pt-1 text-center text-sm text-brand-muted">
          New here?{' '}
          <NavLink
            className="font-semibold text-brand-blue hover:underline hover:decoration-brand-red hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            to="/register"
          >
            Create an account
          </NavLink>
        </p>
      }
    >
      <>
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <InputField
            label={
              <span>
                Username <span className="text-red-500">*</span>
              </span>
            }
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <InputField
            label={
              <span>
                Password <span className="text-red-500">*</span>
              </span>
            }
            id="login-password"
            name="password"
            type="password"
            showPasswordToggle
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="mt-0.5 flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-brand-blue">
              <input
                className="h-4 w-4 accent-brand-red focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:ring-offset-0"
                id="remember-me"
                name="rememberMe"
                type="checkbox"
              />
              <span>Remember me</span>
            </label>

            <Link
              className="text-sm font-semibold text-brand-blue hover:underline hover:decoration-brand-red hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              to="/forgot-password"
              aria-label="Recover password"
            >
              Forgot password?
            </Link>
          </div>

          {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}

          <Button className="w-full" type="submit" disabled={!isFormValid || isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <Modal
          isOpen={isResendModalOpen}
          title="Verify your email"
          description="Enter the email address for your account to receive a new verification link."
          onClose={closeResendModal}
          closeDisabled={isResending}
          maxWidthClassName="max-w-lg"
        >
          <form className="space-y-5 px-6 py-6" onSubmit={handleResendToken} noValidate>
          <AlertBox message={resendError} type="error" />
            <InputField
              label="Email"
              id="login-resend-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
              disabled={isResending}
              required
            />

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeResendModal}
                disabled={isResending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isResending || !resendEmail.trim()}>
                {isResending ? 'Sending...' : 'Send verification link'}
              </Button>
            </div>
          </form>
        </Modal>
      </>
    </AuthPageShell>
  )
}

export default LoginPage

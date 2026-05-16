import { type FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import InputField from '../../components/form/input/InputField'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'

function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    const verify = async () => {
      const search = new URLSearchParams(window.location.search)
      const token = search.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }

      try {
        await authService.verifyEmail(token)
        setStatus('success')
        setMessage('Your email has been verified successfully')
      } catch (error) {
        setStatus('error')
        setMessage(errorHandler(error))
      }
    }

    void verify()
  }, [])

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
    } catch (error) {
      const errorMessage = errorHandler(error)
      setResendError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthPageShell
      activeView="login"
      title="Verify email"
      subtitle="Please wait while we verify your email address."
      footer={
        <p className="m-0 pt-1 text-center text-sm text-brand-muted">
          Return to{' '}
          <Link
            className="font-semibold text-brand-blue hover:underline hover:decoration-brand-red hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            to="/login"
          >
            Login
          </Link>
        </p>
      }
    >
      <div className="grid gap-4">
        <p
          className={`rounded-[0.65rem] border px-3.5 py-3 text-sm ${
            status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : status === 'error'
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-blue-200 bg-blue-50 text-brand-blue'
          }`}
          aria-live="polite"
        >
          {message}
        </p>

        {status !== 'loading' && (
          <Button className="w-full" to="/login">
            Go to Login
          </Button>
        )}

        {status === 'error' ? (
          <form
            className="grid gap-4 rounded-xl border border-slate-200 p-4"
            onSubmit={handleResendToken}
            noValidate
          >
            <InputField
              label="Resend verification email"
              id="resend-token-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
              error={Boolean(resendError)}
              hint={resendError || undefined}
              required
            />
            <Button type="submit" className="w-full" disabled={isResending || !resendEmail.trim()}>
              {isResending ? 'Sending...' : 'Resend verification link'}
            </Button>
          </form>
        ) : null}
      </div>
    </AuthPageShell>
  )
}

export default VerifyEmailPage

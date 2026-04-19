import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'

function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

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
      </div>
    </AuthPageShell>
  )
}

export default VerifyEmailPage

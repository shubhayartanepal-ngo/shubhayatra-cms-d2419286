import { type FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import InputField from '../../components/form/input/InputField'
import AlertBox from '../../components/common/AlertBox'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'

function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const isFormValid = token.trim() !== '' && newPassword.trim() !== ''

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const queryToken = search.get('token')

    if (queryToken) {
      setToken(queryToken)
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token.trim() || !newPassword.trim()) {
      setFormError('Token and new password are required')
      return
    }

    setFormError('')
    setIsLoading(true)

    try {
      await authService.resetPassword({ token: token.trim(), newPassword })
      toast.success('Password reset successful')
      setNewPassword('')
    } catch (error) {
      const message = errorHandler(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      activeView="login"
      title="Reset password"
      subtitle="Set a new password using your reset token."
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
      <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
        {/* <InputField
          label="Token"
          id="reset-token"
          name="token"
          type="text"
          autoComplete="off"
          placeholder="a1b2c3d4-e5f6-7g8h-9i0j"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        /> */}

        <InputField
          label={
            <span>
              New Password <span className="text-red-500">*</span>
            </span>
          }
          id="new-password"
          name="newPassword"
          type="password"
          showPasswordToggle
          autoComplete="new-password"
          placeholder="Enter a new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <AlertBox message={formError} type="error" />

        <Button
          className="w-full"
          type="submit"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default ResetPasswordPage

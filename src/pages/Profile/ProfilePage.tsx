import { type FormEvent, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldCheck, UserRound } from 'lucide-react'

import { errorHandler } from '../../common/errorHandler'
import { getStoredAuthToken } from '../../common/authStorage'
import InputField from '../../components/form/input/InputField'
import Button from '../../components/ui/button/Button'
import AlertBox from '../../components/common/AlertBox'
import authService from '../../services/authService'

type JwtClaims = {
  sub?: string
  username?: string
  userName?: string
  name?: string
  email?: string
  roles?: string[] | string
  role?: string[] | string
  exp?: number
  iat?: number
}

const decodeTokenClaims = (token: string): JwtClaims => {
  const payload = token.split('.')[1]

  if (!payload) {
    return {}
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )

    return JSON.parse(window.atob(paddedPayload)) as JwtClaims
  } catch {
    return {}
  }
}

const formatRoles = (roles: JwtClaims['roles'] | JwtClaims['role']) => {
  if (Array.isArray(roles)) {
    return roles.join(', ')
  }

  return roles || 'Admin'
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000))
}

function ProfilePage() {
  const token = getStoredAuthToken()
  const claims = useMemo(() => decodeTokenClaims(token), [token])
  const displayName = claims.name ?? claims.userName ?? claims.username ?? claims.sub ?? 'Admin'
  const email = claims.email ?? claims.sub ?? 'Not available'
  const roles = formatRoles(claims.roles ?? claims.role)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!oldPassword || !newPassword || !confirmPassword) {
      setFormError('All password fields are required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.')
      return
    }

    setIsSaving(true)
    setFormError('')

    try {
      await authService.changePassword({ oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      const message = errorHandler(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Review your account details and update your password.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Account</h2>
                <p className="text-sm text-slate-500">Signed-in admin profile</p>
              </div>
            </div>
          </div>

          <dl className="divide-y divide-slate-200 px-6">
            <div className="grid gap-1 py-4">
              <dt className="text-xs font-semibold uppercase text-slate-400">Name</dt>
              <dd className="text-sm font-medium text-slate-900">{displayName}</dd>
            </div>
            <div className="grid gap-1 py-4">
              <dt className="text-xs font-semibold uppercase text-slate-400">Email / Username</dt>
              <dd className="text-sm font-medium text-slate-900">{email}</dd>
            </div>
            <div className="grid gap-1 py-4">
              <dt className="text-xs font-semibold uppercase text-slate-400">Role</dt>
              <dd className="text-sm font-medium text-slate-900">{roles}</dd>
            </div>
       
          </dl>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Security</h2>
                <p className="text-sm text-slate-500">Change your account password.</p>
              </div>
            </div>
          </div>

          <form className="space-y-5 px-6 py-6" onSubmit={handleChangePassword} noValidate>
            <AlertBox message={formError} type="error" />

            <InputField
              label="Old password"
              id="profile-old-password"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              showPasswordToggle
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              disabled={isSaving}
              required
            />

            <InputField
              label="New password"
              id="profile-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSaving}
              required
            />

            <InputField
              label="Confirm new password"
              id="profile-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSaving}
              required
            />

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <Button
                type="submit"
                disabled={isSaving || !oldPassword || !newPassword || !confirmPassword}
              >
                {isSaving ? 'Saving...' : 'Change password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default ProfilePage

import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router'
import AuthPageShell from '../../components/auth/AuthPageShell'
import Button from '../../components/ui/button/Button'
import InputField from '../../components/form/input/InputField'
import Select from '../../components/form/Select'
import { Gender } from '../../enums/Gender.enum'
import { UserRole } from '../../enums/UserRole.enum'
import authService from '../../services/authService'
import { errorHandler } from '../../common/errorHandler'

function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    gender: '',
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !formData.userName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.contactNumber.trim() ||
      !formData.address.trim() ||
      !formData.gender
    ) {
      setFormError('Please fill in all required fields')
      return
    }

    setFormError('')
    setIsLoading(true)

    try {
      await authService.register({
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles: [UserRole.USER],
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        gender: formData.gender as Gender,
      })
      toast.success('Registration successful. Please verify your email.')
      navigate('/login')
    } catch (error) {
      const message = errorHandler(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  return (
    <AuthPageShell
      activeView="register"
      title="Create your account"
      subtitle="Register to coordinate volunteer efforts, manage beneficiaries, and track ongoing programs."
      footer={
        <p className="m-0 pt-1 text-center text-sm text-brand-muted">
          Already have an account?{' '}
          <Link
            className="font-semibold text-brand-blue hover:underline hover:decoration-brand-red hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
        <InputField
          label="Username"
          id="userName"
          name="userName"
          type="text"
          autoComplete="username"
          placeholder="johndoe"
          value={formData.userName}
          onChange={(event) => updateField('userName', event.target.value)}
          required
        />

        <InputField
          label="Email address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />

        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          showPasswordToggle
          autoComplete="new-password"
          placeholder="StrongPass1@"
          value={formData.password}
          onChange={(event) => updateField('password', event.target.value)}
          required
        />

 
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-brand-blue">Gender</span>
          <Select
            id="gender"
            name="gender"
            placeholder="Select gender"
            options={[
              { value: Gender.MALE, label: 'Male' },
              { value: Gender.FEMALE, label: 'Female' },
              { value: Gender.OTHER, label: 'Other' },
            ]}
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            required
          />
        </div>

        <InputField
          label="Contact number"
          id="contactNumber"
          name="contactNumber"
          type="tel"
          autoComplete="tel"
          placeholder="+9779800000000"
          value={formData.contactNumber}
          onChange={(event) => updateField('contactNumber', event.target.value)}
          required
        />

        <InputField
          label="Address"
          id="address"
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder="Manigram, Nepal"
          value={formData.address}
          onChange={(event) => updateField('address', event.target.value)}
          required
        />  

        {formError && (
          <p className="rounded-[0.65rem] border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-600" aria-live="polite">
            {formError}
          </p>
        )}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default RegisterPage

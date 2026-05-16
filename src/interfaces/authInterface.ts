import type { Gender } from '../enums/Gender.enum'
import type { UserRole } from '../enums/UserRole.enum'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  userName: string
  email: string
  password: string
  roles: UserRole[]
  contactNumber: string
  address: string
  gender: Gender
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResendTokenPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

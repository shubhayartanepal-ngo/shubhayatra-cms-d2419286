import apiClient from '../common/apiClient'
import { UserRole } from '../enums/UserRole.enum'
import { Gender } from '../enums/Gender.enum'

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

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

const verifyEmailRequests = new Map<string, Promise<unknown>>()

const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post('/auth/login', payload)
    return response.data
  },

  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post('/auth/signup', payload)
    return response.data
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const response = await apiClient.post('/auth/forgot-password', null, {
      params: { email: payload.email },
    })

    return response.data
  },

  verifyEmail: async (token: string) => {
    const cachedRequest = verifyEmailRequests.get(token)

    if (cachedRequest) {
      return cachedRequest
    }

    const request = apiClient
      .get('/auth/verify-email', {
        params: { token },
      })
      .then((response) => response.data)
      .finally(() => {
        verifyEmailRequests.delete(token)
      })

    verifyEmailRequests.set(token, request)

    return request
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const response = await apiClient.post('/auth/reset-password', payload)
    return response.data
  },
}

export default authService

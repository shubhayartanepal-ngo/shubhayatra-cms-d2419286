import apiClient from '../common/apiClient'

export type ContactInquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface ContactInfoPayload {
  location: string
  email: string
  phoneNumber: string
  mapUrl: string
  version: number
}

export interface ContactInfoResponse extends ContactInfoPayload {
  id: number
}

export interface ContactInquiryPayload {
  name: string
  email: string
  phoneNumber: string
  subject: string
  message: string
}

export interface ContactInquiryResponse extends ContactInquiryPayload {
  id: number
  status?: ContactInquiryStatus
  createdAt?: string
}

type ApiEnvelope<T> = {
  data?: T
  message?: string
  success?: boolean
  status?: boolean
}

const unwrapData = <T>(response: { data?: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T | undefined

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

const contactService = {
  getContactInfo: async (): Promise<ContactInfoResponse> => {
    const response = await apiClient.get('/v1/public/contact/info')
    return unwrapData<ContactInfoResponse>(response)
  },

  saveContactInfo: async (payload: ContactInfoPayload): Promise<ContactInfoResponse> => {
    const response = await apiClient.put('/v1/admin/contact/info', payload)
    return unwrapData<ContactInfoResponse>(response)
  },

  submitInquiry: async (payload: ContactInquiryPayload): Promise<ContactInquiryResponse> => {
    const response = await apiClient.post('/v1/public/contact/inquiry', payload)
    return unwrapData<ContactInquiryResponse>(response)
  },

  updateInquiryStatus: async (
    id: string | number,
    status: ContactInquiryStatus
  ): Promise<ContactInquiryResponse> => {
    const response = await apiClient.patch(`/v1/admin/contact/inquiry/${id}/status`, null, {
      params: { status },
    })

    return unwrapData<ContactInquiryResponse>(response)
  },
}

export default contactService

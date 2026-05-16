import apiClient from '../common/apiClient'

export interface TeamReference {
  teamId?: number | string
  id?: number | string
}

export type SortDirection = 'ASC' | 'DESC'

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
  direction?: SortDirection
}

export interface PaginatedResponse<T> {
  status: boolean
  message: string
  data: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  lastPage: boolean
}

type ApiEnvelope<T> = {
  message?: string
  data?: T
  path?: string
  timestamp?: string
}

export interface TeamHonorificReference {
  honorificId?: number
  honorificTitle?: string
  title?: string
  name?: string
}

export interface HonorificRecord {
  honorificId?: number
  honorificTitle?: string
  title?: string
  name?: string
}

export interface TeamDesignationReference {
  designationId?: number
  designationTitle?: string
  title?: string
  name?: string
}

export interface DesignationRecord {
  designationId?: number
  designationTitle?: string
  title?: string
  name?: string
}

export interface TeamRecord extends TeamReference {
  teamName?: string
  teamTwitterLink?: string
  teamLinkedInLink?: string
  teamFacebookLink?: string
  honorific?: TeamHonorificReference | null
  designations?: TeamDesignationReference[]
  profileImageUrl?: string
  teamProfilePic?: string | null
  imageUrl?: string
  profileImage?: string
}

export interface TeamPayload {
  teamName: string
  teamTwitterLink?: string
  teamLinkedInLink?: string
  teamFacebookLink?: string
  honorific: {
    honorificId: number
  }
  designations: Array<{
    designationId: number
  }>
}

export type HonorificPayload = Pick<HonorificRecord, 'honorificTitle'>
export type DesignationPayload = Pick<DesignationRecord, 'designationTitle'>

const unwrapData = <T>(response: { data?: ApiEnvelope<T> | T }): T => {
  const payload = response.data as ApiEnvelope<T> | T | undefined

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

const normalizePaginationParams = (
  params: PaginationParams | undefined,
  defaultSort: string
): Required<PaginationParams> => ({
  page: params?.page ?? 0,
  size: params?.size ?? 10,
  sort: params?.sort ?? defaultSort,
  direction: params?.direction ?? 'ASC',
})

const resolveList = (payload: unknown): TeamRecord[] => {
  if (Array.isArray(payload)) {
    return payload as TeamRecord[]
  }

  if (payload && typeof payload === 'object') {
    const responseObject = payload as {
      data?: TeamRecord[]
      teams?: TeamRecord[]
      items?: TeamRecord[]
    }

    return responseObject.data || responseObject.teams || responseObject.items || []
  }

  return []
}

const resolveHonorificList = (payload: unknown): HonorificRecord[] => {
  if (Array.isArray(payload)) {
    return payload as HonorificRecord[]
  }

  if (payload && typeof payload === 'object') {
    const responseObject = payload as {
      data?: HonorificRecord[]
      honorifics?: HonorificRecord[]
      items?: HonorificRecord[]
    }

    return responseObject.data || responseObject.honorifics || responseObject.items || []
  }

  return []
}

const resolveDesignationList = (payload: unknown): DesignationRecord[] => {
  if (Array.isArray(payload)) {
    return payload as DesignationRecord[]
  }

  if (payload && typeof payload === 'object') {
    const responseObject = payload as {
      data?: DesignationRecord[]
      designations?: DesignationRecord[]
      items?: DesignationRecord[]
    }

    return responseObject.data || responseObject.designations || responseObject.items || []
  }

  return []
}

const teamService = {
  listHonorifics: async (): Promise<HonorificRecord[]> => {
    const response = await apiClient.get('/v1/public/honorific')
    return resolveHonorificList(
      unwrapData<
        | HonorificRecord[]
        | { data?: HonorificRecord[]; honorifics?: HonorificRecord[]; items?: HonorificRecord[] }
      >(response)
    )
  },

  listHonorificDetails: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<HonorificRecord>> => {
    const response = await apiClient.get('/v1/public/honorific-details', {
      params: normalizePaginationParams(params, 'honorificId'),
    })

    return response.data as PaginatedResponse<HonorificRecord>
  },

  getHonorific: async (honorificId: string | number): Promise<HonorificRecord> => {
    const response = await apiClient.get(`/v1/admin/honorific/${honorificId}`)
    return unwrapData<HonorificRecord>(response)
  },

  createHonorifics: async (payload: HonorificPayload[]): Promise<HonorificRecord[]> => {
    const response = await apiClient.post('/v1/admin/honorific', payload)
    return resolveHonorificList(
      unwrapData<
        | HonorificRecord[]
        | { data?: HonorificRecord[]; honorifics?: HonorificRecord[]; items?: HonorificRecord[] }
      >(response)
    )
  },

  updateHonorific: async (
    honorificId: string | number,
    payload: HonorificPayload
  ): Promise<HonorificRecord> => {
    const response = await apiClient.put(`/v1/admin/honorific/${honorificId}`, payload)
    return unwrapData<HonorificRecord>(response)
  },

  deleteHonorific: async (honorificId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/honorific/${honorificId}`)
  },

  listDesignations: async (): Promise<DesignationRecord[]> => {
    const response = await apiClient.get('/v1/public/designation')
    return resolveDesignationList(
      unwrapData<
        | DesignationRecord[]
        | {
            data?: DesignationRecord[]
            designations?: DesignationRecord[]
            items?: DesignationRecord[]
          }
      >(response)
    )
  },

  listDesignationDetails: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<DesignationRecord>> => {
    const response = await apiClient.get('/v1/public/designation-details', {
      params: normalizePaginationParams(params, 'designationId'),
    })

    return response.data as PaginatedResponse<DesignationRecord>
  },

  getDesignation: async (designationId: string | number): Promise<DesignationRecord> => {
    const response = await apiClient.get(`/v1/admin/designation/${designationId}`)
    return unwrapData<DesignationRecord>(response)
  },

  createDesignations: async (payload: DesignationPayload[]): Promise<DesignationRecord[]> => {
    const response = await apiClient.post('/v1/admin/designation', payload)
    return resolveDesignationList(
      unwrapData<
        | DesignationRecord[]
        | {
            data?: DesignationRecord[]
            designations?: DesignationRecord[]
            items?: DesignationRecord[]
          }
      >(response)
    )
  },

  updateDesignation: async (
    designationId: string | number,
    payload: DesignationPayload
  ): Promise<DesignationRecord> => {
    const response = await apiClient.put(`/v1/admin/designation/${designationId}`, payload)
    return unwrapData<DesignationRecord>(response)
  },

  deleteDesignation: async (designationId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/designation/${designationId}`)
  },

  listTeamDetails: async (params?: PaginationParams): Promise<PaginatedResponse<TeamRecord>> => {
    const response = await apiClient.get('/v1/public/team', {
      params: normalizePaginationParams(params, 'teamId'),
    })

    return response.data as PaginatedResponse<TeamRecord>
  },

  listTeams: async (params?: PaginationParams): Promise<TeamRecord[]> => {
    const response = await apiClient.get('/v1/public/team', {
      params: normalizePaginationParams(params, 'teamId'),
    })

    return resolveList(
      unwrapData<
        TeamRecord[] | { data?: TeamRecord[]; teams?: TeamRecord[]; items?: TeamRecord[] }
      >(response)
    )
  },

  getTeam: async (teamId: string | number): Promise<TeamRecord> => {
    const response = await apiClient.get(`/v1/public/team/${teamId}`)
    return unwrapData<TeamRecord>(response)
  },

  createTeam: async (payload: TeamPayload): Promise<TeamRecord> => {
    const response = await apiClient.post('/v1/admin/team', payload)
    return unwrapData<TeamRecord>(response)
  },

  updateTeam: async (teamId: string | number, payload: TeamPayload): Promise<TeamRecord> => {
    const response = await apiClient.put(`/v1/admin/team/${teamId}`, payload)
    return unwrapData<TeamRecord>(response)
  },

  uploadProfileImage: async (teamId: string | number, file: File): Promise<TeamRecord> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.put(`/v1/admin/team/${teamId}/profileImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return unwrapData<TeamRecord>(response)
  },

  deleteTeam: async (teamId: string | number): Promise<void> => {
    await apiClient.delete(`/v1/admin/team/${teamId}`)
  },
}

export default teamService

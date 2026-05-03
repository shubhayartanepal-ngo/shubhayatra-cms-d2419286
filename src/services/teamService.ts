import apiClient from '../common/apiClient'

export interface TeamReference {
  teamId?: number | string
  id?: number | string
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
  teamProfilePic?: string
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

const unwrapData = <T>(response: { data?: { data?: T } | T }): T => {
  const payload = response.data as { data?: T } | T | undefined

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data?: T }).data as T
  }

  return payload as T
}

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

  listTeams: async (): Promise<TeamRecord[]> => {
    const response = await apiClient.get('/v1/public/team')
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

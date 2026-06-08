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
}

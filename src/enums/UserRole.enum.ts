export const UserRole = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof Role)[keyof typeof Role]
